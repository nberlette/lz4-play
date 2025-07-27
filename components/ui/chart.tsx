"use client";

import * as React from "react";
import type { ChartTooltipProps } from "recharts";
import { cn } from "@/lib/utils";
import * as RechartsPrimitive from "recharts";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
    formatter?: (value: number) => string;
  };
}

interface ChartContainerProps {
  children: React.ReactNode;
  config: ChartConfig;
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <ChartContext.Provider value={config}>
      <div className="h-full w-full">{children}</div>
    </ChartContext.Provider>
  );
}

const ChartContext = React.createContext<ChartConfig | null>(null);

export function useChartConfig() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer");
  }
  return context;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

export function ChartTooltipContent(
  { active, payload, label }: ChartTooltipContentProps,
) {
  const config = useChartConfig();

  if (!active || !payload?.length || !config) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="grid gap-1">
          {payload.map((data) => {
            const dataConfig = config[data.dataKey];
            if (!dataConfig) {
              return null;
            }

            const value = data.value;
            const formattedValue = dataConfig.formatter
              ? dataConfig.formatter(value)
              : value.toString();

            return (
              <div
                key={data.dataKey}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: dataConfig.color,
                    }}
                  />
                  <div className="text-xs font-medium">{dataConfig.label}</div>
                </div>
                <div className="text-xs font-medium">{formattedValue}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ChartTooltip(props: ChartTooltipProps<any, any>) {
  return (
    <ChartTooltipContent {...(props as unknown as ChartTooltipContentProps)} />
  );
}

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  & React.ComponentProps<"div">
  & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign">
  & {
    hideIcon?: boolean;
    nameKey?: string;
  }
>((
  { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
  ref,
) => {
  const { config } = useChartConfig();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = config[key];

        return (
          <div
            key={item.value}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
            )}
          >
            {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" &&
      payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload && typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey =
      payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  return null;
};

export { ChartLegend, ChartLegendContent, ChartStyle };
