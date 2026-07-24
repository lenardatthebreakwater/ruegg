import { Fragment } from "react";
import { Clock, Sun } from "lucide-react";
import {
  OPENING_HOURS,
  SUMMER_OPENING_HOURS,
  SUMMER_OPENING_HOURS_PERIOD,
} from "@/lib/data/opening-hours";

function OpeningHoursList({
  rows,
}: {
  rows: readonly { day: string; hours: string }[];
}) {
  return (
    <dl className="grid w-full max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm text-neutral-400">
      {rows.map(({ day, hours }) => (
        <Fragment key={day}>
          <dt className="text-neutral-300">{day}</dt>
          <dd className="m-0 tabular-nums">{hours}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export function FooterOpeningHours() {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="flex min-h-9 items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-100">
        <Clock className="size-4" aria-hidden />
        Åpningstider
      </h3>
      <OpeningHoursList rows={OPENING_HOURS} />
      <div className="flex flex-col gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-100">
          <Sun className="size-4" aria-hidden />
          Sommeråpningstider
        </h4>
        <p className="text-sm text-neutral-500">{SUMMER_OPENING_HOURS_PERIOD}</p>
        <OpeningHoursList rows={SUMMER_OPENING_HOURS} />
      </div>
    </section>
  );
}
