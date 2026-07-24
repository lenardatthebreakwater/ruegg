<?php
/**
 * PB GraphQL Error Log
 *
 * Version: 1.1.0
 * Updated: 2026-07-14
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, run everywhere), OR
 * - mu-plugin: wp-content/mu-plugins/pb-graphql-error-log.php
 *
 * Why this exists:
 * - Full-catalog Next.js prerender hammers /graphql. Some failures return
 *   HTTP 500 with body "Internal server error" and never hit php-error.log
 *   when WP_DEBUG_LOG is off / display is suppressed.
 * - This snippet logs **GraphQL requests only** (not general WP traffic) to
 *   wp-content/pb-graphql-errors.log and optionally error_log().
 *
 * What it captures (v1.1):
 * 1) Real GraphQL error messages, paths, extensions (not just "contained errors")
 * 2) Operation name + sanitized variables (slug, brandSlug, etc.)
 * 3) PHP fatals during a GraphQL request via shutdown handler
 *
 * Does NOT enable WP_DEBUG or GRAPHQL_DEBUG (no query dumps in HTTP responses).
 * Optional: define('PB_GRAPHQL_ERROR_LOG_TO_ERROR_LOG', true) to also mirror
 * lines into the host PHP error log.
 *
 * Check installed version: file header Version / PB_GRAPHQL_ERROR_LOG_SNIPPET_VERSION
 * (no REST health). Inventory: docs/wordpress/SNIPPETS.md
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_GRAPHQL_ERROR_LOG_SNIPPET_VERSION')) {
	define('PB_GRAPHQL_ERROR_LOG_SNIPPET_VERSION', '1.1.0');
}

/**
 * Absolute path to the dedicated GraphQL error log file.
 */
function pb_graphql_error_log_path() {
	return WP_CONTENT_DIR . '/pb-graphql-errors.log';
}

/**
 * True when the current HTTP request is a WPGraphQL request.
 */
function pb_graphql_error_log_is_graphql_request() {
	if (defined('GRAPHQL_REQUEST') && GRAPHQL_REQUEST) {
		return true;
	}
	if (function_exists('is_graphql_http_request') && is_graphql_http_request()) {
		return true;
	}
	$request_uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
	$path = (string) wp_parse_url($request_uri, PHP_URL_PATH);
	return (bool) preg_match('#/(index\\.php/)?graphql/?$#', $path);
}

/**
 * Append one line to the dedicated log (and optionally PHP error_log).
 *
 * @param string              $level   e.g. ERROR, FATAL
 * @param string              $message Short message
 * @param array<string,mixed> $context Extra fields (truncateded JSON)
 */
function pb_graphql_error_log_write($level, $message, array $context = []) {
	$line = sprintf(
		"[%s] [%s] %s %s\n",
		gmdate('c'),
		$level,
		$message,
		$context ? wp_json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : ''
	);

	$path = pb_graphql_error_log_path();
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	@file_put_contents($path, $line, FILE_APPEND | LOCK_EX);

	if (defined('PB_GRAPHQL_ERROR_LOG_TO_ERROR_LOG') && PB_GRAPHQL_ERROR_LOG_TO_ERROR_LOG) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(rtrim($line));
	}
}

/**
 * Truncate a string for the log.
 *
 * @param mixed $value
 * @param int   $max
 * @return string
 */
function pb_graphql_error_log_truncate($value, $max = 500) {
	if (!is_string($value) || $value === '') {
		return '';
	}
	$value = preg_replace('/\s+/', ' ', $value);
	if (strlen($value) > $max) {
		return substr($value, 0, $max) . '…';
	}
	return $value;
}

/**
 * Extract operation name from a query document.
 *
 * @param mixed $query
 * @return string
 */
function pb_graphql_error_log_operation_name($query) {
	if (!is_string($query) || $query === '') {
		return '';
	}
	if (preg_match('/\b(?:query|mutation|subscription)\s+([A-Za-z_][A-Za-z0-9_]*)/', $query, $m)) {
		return $m[1];
	}
	return '';
}

/**
 * Sanitize variables for logging (keep useful keys, drop huge blobs).
 *
 * @param mixed $variables
 * @return array<string,mixed>|null
 */
function pb_graphql_error_log_sanitize_variables($variables) {
	if (!is_array($variables) || !$variables) {
		return null;
	}

	$out = [];
	foreach ($variables as $key => $value) {
		$key = (string) $key;
		if (is_scalar($value) || $value === null) {
			$out[$key] = is_string($value) ? pb_graphql_error_log_truncate($value, 200) : $value;
			continue;
		}
		if (is_array($value)) {
			// Keep small arrays (e.g. brandSlug: ["nordpeis"]).
			$encoded = wp_json_encode($value);
			$out[$key] = pb_graphql_error_log_truncate(is_string($encoded) ? $encoded : '[array]', 300);
			continue;
		}
		$out[$key] = '[' . gettype($value) . ']';
	}

	return $out;
}

/**
 * Normalize one GraphQL error into a plain array with a real message.
 *
 * @param mixed $error
 * @return array<string,mixed>
 */
function pb_graphql_error_log_normalize_error($error) {
	$message = '';
	$path = null;
	$locations = null;
	$extensions = null;
	$category = null;

	if ($error instanceof \Throwable) {
		$message = $error->getMessage();
		if (method_exists($error, 'getPath')) {
			try {
				$path = $error->getPath();
			} catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			}
		}
		if (method_exists($error, 'getLocations')) {
			try {
				$locations = $error->getLocations();
			} catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			}
		}
		if (method_exists($error, 'getExtensions')) {
			try {
				$extensions = $error->getExtensions();
			} catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			}
		}
		if (method_exists($error, 'getCategory')) {
			try {
				$category = $error->getCategory();
			} catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			}
		}
	} elseif (is_array($error)) {
		$message = isset($error['message']) ? (string) $error['message'] : '';
		$path = $error['path'] ?? null;
		$locations = $error['locations'] ?? null;
		$extensions = $error['extensions'] ?? null;
		$category = $error['category'] ?? null;
	} elseif (is_object($error)) {
		// Avoid isset($error->message) — GraphQL\Error\Error often hides props.
		if (method_exists($error, 'getMessage')) {
			$message = (string) $error->getMessage();
		} elseif (isset($error->message)) {
			$message = (string) $error->message;
		}
		if (method_exists($error, 'getPath')) {
			$path = $error->getPath();
		} elseif (isset($error->path)) {
			$path = $error->path;
		}
		if (method_exists($error, 'getLocations')) {
			$locations = $error->getLocations();
		} elseif (isset($error->locations)) {
			$locations = $error->locations;
		}
		if (method_exists($error, 'getExtensions')) {
			$extensions = $error->getExtensions();
		} elseif (isset($error->extensions)) {
			$extensions = $error->extensions;
		}
		if (method_exists($error, 'jsonSerialize')) {
			try {
				$serialized = $error->jsonSerialize();
				if (is_array($serialized)) {
					if ($message === '' && !empty($serialized['message'])) {
						$message = (string) $serialized['message'];
					}
					if ($path === null && isset($serialized['path'])) {
						$path = $serialized['path'];
					}
					if ($locations === null && isset($serialized['locations'])) {
						$locations = $serialized['locations'];
					}
					if ($extensions === null && isset($serialized['extensions'])) {
						$extensions = $serialized['extensions'];
					}
				}
			} catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			}
		}
	}

	if ($message === '') {
		$message = 'Unknown GraphQL error (' . (is_object($error) ? get_class($error) : gettype($error)) . ')';
	}

	$normalized = [
		'message' => pb_graphql_error_log_truncate($message, 800),
	];
	if ($path !== null) {
		$normalized['path'] = $path;
	}
	if ($locations !== null) {
		$normalized['locations'] = $locations;
	}
	if ($category !== null) {
		$normalized['category'] = $category;
	}
	if (is_array($extensions) && $extensions) {
		// Keep debug/trace hints but cap size.
		$encoded = wp_json_encode($extensions);
		$normalized['extensions'] = pb_graphql_error_log_truncate(is_string($encoded) ? $encoded : '', 800);
	}

	return $normalized;
}

/**
 * Pull errors array from a GraphQL response (object or array).
 *
 * @param mixed $response
 * @return array<int,mixed>|null
 */
function pb_graphql_error_log_extract_errors($response) {
	if (is_object($response) && !empty($response->errors) && is_array($response->errors)) {
		return $response->errors;
	}
	if (is_array($response) && !empty($response['errors']) && is_array($response['errors'])) {
		return $response['errors'];
	}
	return null;
}

/**
 * Register fatal catcher only for GraphQL HTTP requests.
 */
function pb_graphql_error_log_boot_shutdown() {
	if (!pb_graphql_error_log_is_graphql_request()) {
		return;
	}

	$GLOBALS['pb_graphql_error_log_logged'] = false;

	$raw_input = file_get_contents('php://input');
	$query_preview = '';
	$variables = null;
	$operation = '';
	if (is_string($raw_input) && $raw_input !== '') {
		$decoded = json_decode($raw_input, true);
		if (is_array($decoded)) {
			if (!empty($decoded['query'])) {
				$query_preview = pb_graphql_error_log_truncate($decoded['query'], 400);
				$operation = pb_graphql_error_log_operation_name($decoded['query']);
			}
			if (!empty($decoded['operationName']) && is_string($decoded['operationName'])) {
				$operation = $decoded['operationName'];
			}
			if (isset($decoded['variables'])) {
				$variables = pb_graphql_error_log_sanitize_variables($decoded['variables']);
			}
		}
	}

	register_shutdown_function(static function () use ($query_preview, $variables, $operation) {
		$err = error_get_last();
		if (!$err || !is_array($err)) {
			return;
		}
		$fatal_types = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];
		if (!in_array((int) $err['type'], $fatal_types, true)) {
			return;
		}
		pb_graphql_error_log_write(
			'FATAL',
			isset($err['message']) ? (string) $err['message'] : 'PHP fatal during GraphQL',
			[
				'file' => $err['file'] ?? null,
				'line' => $err['line'] ?? null,
				'type' => $err['type'] ?? null,
				'operation' => $operation ?: null,
				'variables' => $variables,
				'query' => $query_preview,
			]
		);
	});
}
add_action('init', 'pb_graphql_error_log_boot_shutdown', 0);

/**
 * Log GraphQL execution errors with real messages + variables.
 *
 * @param mixed                    $response
 * @param mixed                    $schema
 * @param string|null              $operation
 * @param string|null              $query
 * @param array<string,mixed>|null $variables
 * @return mixed
 */
function pb_graphql_error_log_on_results($response, $schema = null, $operation = null, $query = null, $variables = null) {
	if (!pb_graphql_error_log_is_graphql_request()) {
		return $response;
	}

	$errors = pb_graphql_error_log_extract_errors($response);
	if (!$errors) {
		return $response;
	}

	$normalized = [];
	foreach ($errors as $error) {
		$normalized[] = pb_graphql_error_log_normalize_error($error);
	}

	$messages = array_values(array_filter(array_map(static function ($e) {
		return isset($e['message']) ? (string) $e['message'] : '';
	}, $normalized)));

	$op = is_string($operation) && $operation !== ''
		? $operation
		: pb_graphql_error_log_operation_name($query);

	pb_graphql_error_log_write(
		'ERROR',
		implode(' | ', $messages) ?: 'GraphQL response contained errors',
		[
			'error_count' => count($normalized),
			'operation' => $op ?: null,
			'variables' => pb_graphql_error_log_sanitize_variables($variables),
			'errors' => $normalized,
			'query' => pb_graphql_error_log_truncate($query, 350),
		]
	);

	$GLOBALS['pb_graphql_error_log_logged'] = true;

	return $response;
}
add_filter('graphql_request_results', 'pb_graphql_error_log_on_results', 99, 5);

/**
 * Fallback if graphql_request_results did not see errors (unusual response shape).
 *
 * @param mixed                    $filtered_response
 * @param mixed                    $response
 * @param mixed                    $schema
 * @param string|null              $operation
 * @param string|null              $query
 * @param array<string,mixed>|null $variables
 */
function pb_graphql_error_log_on_return_response($filtered_response, $response = null, $schema = null, $operation = null, $query = null, $variables = null) {
	if (!pb_graphql_error_log_is_graphql_request()) {
		return;
	}
	if (!empty($GLOBALS['pb_graphql_error_log_logged'])) {
		return;
	}

	$errors = pb_graphql_error_log_extract_errors($filtered_response);
	if (!$errors) {
		$errors = pb_graphql_error_log_extract_errors($response);
	}
	if (!$errors) {
		return;
	}

	$normalized = [];
	foreach ($errors as $error) {
		$normalized[] = pb_graphql_error_log_normalize_error($error);
	}
	$messages = array_values(array_filter(array_map(static function ($e) {
		return isset($e['message']) ? (string) $e['message'] : '';
	}, $normalized)));

	$op = is_string($operation) && $operation !== ''
		? $operation
		: pb_graphql_error_log_operation_name($query);

	pb_graphql_error_log_write(
		'ERROR',
		implode(' | ', $messages) !== '' ? implode(' | ', $messages) : 'GraphQL operation returned with errors',
		[
			'error_count' => count($normalized),
			'operation' => $op ?: null,
			'variables' => pb_graphql_error_log_sanitize_variables($variables),
			'errors' => $normalized,
			'query' => pb_graphql_error_log_truncate($query, 350),
			'source' => 'graphql_return_response',
		]
	);

	$GLOBALS['pb_graphql_error_log_logged'] = true;
}
add_action('graphql_return_response', 'pb_graphql_error_log_on_return_response', 10, 6);
