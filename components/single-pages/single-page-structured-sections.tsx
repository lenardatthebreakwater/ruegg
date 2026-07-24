import Link from "next/link";
import { PlayCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import type {
  ShippingSummarySection,
  SummaryAccordionSection,
  SummaryVideoItem,
} from "@/lib/data/single-pages";
import { SummaryYoutubeEmbed } from "./summary-youtube-embed";

type SinglePageStructuredSectionsProps = {
  shippingSummary?: ShippingSummarySection;
  accordionSections?: SummaryAccordionSection[];
  videos?: SummaryVideoItem[];
};

export function SinglePageStructuredSections({
  shippingSummary,
  accordionSections,
  videos,
}: SinglePageStructuredSectionsProps) {
  let sectionIndex = 0;

  const nextDelay = () => {
    const delay = sectionIndex * 0.08;
    sectionIndex += 1;
    return delay;
  };

  return (
    <div className="flex flex-col gap-8">
      {shippingSummary ? (
        <MotionPreset
          fade
          blur
          slide={{ direction: "up", offset: 32 }}
          delay={nextDelay()}
          transition={{ duration: 0.5 }}
        >
          <ShippingSummaryBlock shipping={shippingSummary} />
        </MotionPreset>
      ) : null}

      {accordionSections && accordionSections.length > 0
        ? accordionSections.map((section) => (
            <MotionPreset
              key={section.title}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              delay={nextDelay()}
              transition={{ duration: 0.45 }}
            >
              <Card className="border border-border shadow-xs">
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description ? (
                    <CardDescription>{section.description}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {section.items.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger>{item.title}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{item.content}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </MotionPreset>
          ))
        : null}

      {videos && videos.length > 0 ? (
        <MotionPreset
          fade
          blur
          slide={{ direction: "up", offset: 32 }}
          delay={nextDelay()}
          transition={{ duration: 0.45 }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {videos.map((video) => (
              <SummaryVideoCard
                key={`${video.href}-${video.youtubeVideoId ?? "link"}`}
                video={video}
              />
            ))}
          </div>
        </MotionPreset>
      ) : null}
    </div>
  );
}

function SummaryVideoCard({ video }: { video: SummaryVideoItem }) {
  return (
    <Card className="border border-border shadow-xs">
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
        <CardDescription>{video.description}</CardDescription>
      </CardHeader>
      {video.youtubeVideoId ? (
        <CardContent className="pt-0">
          <SummaryYoutubeEmbed videoId={video.youtubeVideoId} title={video.title} />
        </CardContent>
      ) : null}
      <CardFooter className="pt-0">
        <Button asChild variant="redOutline">
          <Link href={video.href}>
            <PlayCircle data-icon="inline-start" />
            {video.ctaLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ShippingSummaryBlock({ shipping }: { shipping: ShippingSummarySection }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="border border-border shadow-xs">
        <CardHeader>
          <CardTitle>Hjemlevering (35-599 kg)</CardTitle>
          <CardDescription>{shipping.homeDeliveryIntro}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Fra postnr</th>
                  <th className="px-3 py-2 font-medium">Til postnr</th>
                  <th className="px-3 py-2 font-medium">35-199 kg</th>
                  <th className="px-3 py-2 font-medium">200-499 kg</th>
                  <th className="px-3 py-2 font-medium">500-599 kg</th>
                </tr>
              </thead>
              <tbody>
                {shipping.homeDeliveryRates.map((rate) => (
                  <tr key={`${rate.fromPostcode}-${rate.toPostcode}`} className="border-t border-border">
                    <td className="px-3 py-2">{rate.fromPostcode}</td>
                    <td className="px-3 py-2">{rate.toPostcode}</td>
                    <td className="px-3 py-2">{rate.price35to199}</td>
                    <td className="px-3 py-2">{rate.price200to499}</td>
                    <td className="px-3 py-2">{rate.price500to599}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shipping.homeDeliveryNote ? (
            <p className="text-sm text-muted-foreground">{shipping.homeDeliveryNote}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <CardTitle>Småpakker (under 35 kg)</CardTitle>
            <CardDescription>{shipping.smallPackageIntro}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Vekt</th>
                    <th className="px-3 py-2 font-medium">Pris</th>
                  </tr>
                </thead>
                <tbody>
                  {shipping.smallPackageRates.map((rate) => (
                    <tr key={rate.weightRange} className="border-t border-border">
                      <td className="px-3 py-2">{rate.weightRange}</td>
                      <td className="px-3 py-2">{rate.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-xs">
          <CardHeader>
            <CardTitle>Ved mottak av vare</CardTitle>
            <CardDescription>{shipping.damageNotice}</CardDescription>
          </CardHeader>
          {shipping.svalbardNote ? (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{shipping.svalbardNote}</p>
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
