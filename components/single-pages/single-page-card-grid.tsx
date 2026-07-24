import {
  AlertTriangle,
  Banknote,
  Calendar,
  Clock3,
  Database,
  Droplets,
  Eye,
  FileText,
  Flame,
  Layers,
  Leaf,
  Lock,
  Mail,
  MonitorSmartphone,
  Package,
  Palette,
  PieChart,
  Receipt,
  Scale,
  ShieldCheck,
  Percent,
  Truck,
  UserCheck,
  Video,
  VolumeX,
  Wind,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { MotionPreset } from "@/components/ui/motion-preset";
import { cn } from "@/lib/utils";
import type { SinglePageIconKey, SummaryCardItem } from "@/lib/data/single-pages";

const iconMap: Record<SinglePageIconKey, LucideIcon> = {
  truck: Truck,
  package: Package,
  clock3: Clock3,
  shieldCheck: ShieldCheck,
  alertTriangle: AlertTriangle,
  fileText: FileText,
  receipt: Receipt,
  scale: Scale,
  userCheck: UserCheck,
  flame: Flame,
  wind: Wind,
  droplets: Droplets,
  wrench: Wrench,
  video: Video,
  lock: Lock,
  database: Database,
  mail: Mail,
  eye: Eye,
  percent: Percent,
  banknote: Banknote,
  calendar: Calendar,
  pieChart: PieChart,
  layers: Layers,
  smartphone: MonitorSmartphone,
  wifi: Wifi,
  volumeX: VolumeX,
  leaf: Leaf,
  palette: Palette,
  zap: Zap,
};

type SinglePageCardGridProps = {
  items: SummaryCardItem[];
};

function cardGridClassName(count: number) {
  if (count <= 1) {
    return "grid grid-cols-1 gap-5";
  }
  if (count === 2) {
    return "grid grid-cols-1 gap-5 md:grid-cols-2";
  }
  if (count === 3) {
    return "grid grid-cols-1 gap-5 md:grid-cols-3";
  }
  return "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4";
}

export function SinglePageCardGrid({ items }: SinglePageCardGridProps) {
  return (
    <div className={cn(cardGridClassName(items.length))}>
      {items.map((item, index) => {
        const Icon = iconMap[item.iconKey];

        return (
          <MotionPreset
            key={item.title}
            className="h-full"
            fade
            blur
            slide={{ direction: "up", offset: 28 }}
            delay={index * 0.07}
            transition={{ duration: 0.45 }}
          >
            <Card className="h-full border border-border shadow-xs">
              <CardHeader className="gap-3">
                <IconBadge icon={Icon} />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              {item.bullets && item.bullets.length > 0 ? (
                <CardContent className="pt-0">
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </CardContent>
              ) : null}
            </Card>
          </MotionPreset>
        );
      })}
    </div>
  );
}
