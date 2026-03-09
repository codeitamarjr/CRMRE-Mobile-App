import React from "react";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

type FacilityIconProps = {
  identifier?: string;
  size?: number;
  color?: string;
};

const includesAny = (value: string, terms: string[]): boolean =>
  terms.some((term) => value.includes(term));

const glyphForIdentifier = (identifier?: string): string => {
  const value = (identifier ?? "").toLowerCase();

  if (includesAny(value, ["wifi", "internet"])) return "wifi";
  if (includesAny(value, ["car", "parking", "garage", "evcharging"])) return "car";
  if (includesAny(value, ["laundry", "washing", "dryer"])) return "laundry";
  if (includesAny(value, ["gym", "sports", "play", "sauna"])) return "fitness";
  if (includesAny(value, ["pet", "dog"])) return "pet";
  if (includesAny(value, ["swim", "pool"])) return "swim";
  if (includesAny(value, ["security", "cctv", "intercom", "gate"])) return "security";
  if (includesAny(value, ["elevator", "wheelchair"])) return "access";
  if (includesAny(value, ["workspace", "meeting", "coworking"])) return "workspace";
  if (includesAny(value, ["tv", "cinema"])) return "screen";
  if (includesAny(value, ["balcony", "terrace", "garden"])) return "outdoor";
  if (includesAny(value, ["dishwasher", "hob", "oven", "microwave", "fridge", "furnished"])) return "kitchen";

  return "info";
};

const FacilityIcon = ({ identifier, size = 22, color = "#0061FF" }: FacilityIconProps) => {
  const glyph = glyphForIdentifier(identifier);
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph === "wifi" && (
        <>
          <Path d="M2.5 8.5C7.8 3.8 16.2 3.8 21.5 8.5" {...strokeProps} />
          <Path d="M5.8 12c3.7-3.2 8.7-3.2 12.4 0" {...strokeProps} />
          <Path d="M9.1 15.5c1.8-1.6 4-1.6 5.8 0" {...strokeProps} />
          <Circle cx="12" cy="19" r="1.1" fill={color} />
        </>
      )}
      {glyph === "car" && (
        <>
          <Path d="M4 14l1.6-4.2A2 2 0 0 1 7.5 8.5h9a2 2 0 0 1 1.9 1.3L20 14" {...strokeProps} />
          <Rect x="3.5" y="14" width="17" height="4.5" rx="1.2" {...strokeProps} />
          <Circle cx="7.5" cy="18.5" r="1.2" fill={color} />
          <Circle cx="16.5" cy="18.5" r="1.2" fill={color} />
        </>
      )}
      {glyph === "laundry" && (
        <>
          <Rect x="4.5" y="3.5" width="15" height="17" rx="2" {...strokeProps} />
          <Circle cx="12" cy="13" r="4.2" {...strokeProps} />
          <Line x1="7.5" y1="6.8" x2="8.2" y2="6.8" {...strokeProps} />
          <Line x1="10" y1="6.8" x2="10.7" y2="6.8" {...strokeProps} />
        </>
      )}
      {glyph === "fitness" && (
        <>
          <Line x1="5" y1="10" x2="9" y2="10" {...strokeProps} />
          <Line x1="15" y1="14" x2="19" y2="14" {...strokeProps} />
          <Rect x="9" y="9" width="6" height="2" rx="1" {...strokeProps} />
          <Rect x="9" y="13" width="6" height="2" rx="1" {...strokeProps} />
          <Line x1="9" y1="10" x2="15" y2="14" {...strokeProps} />
        </>
      )}
      {glyph === "pet" && (
        <>
          <Circle cx="8" cy="8.2" r="1.6" {...strokeProps} />
          <Circle cx="12" cy="6.8" r="1.6" {...strokeProps} />
          <Circle cx="16" cy="8.2" r="1.6" {...strokeProps} />
          <Path d="M8 14.8c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2-1.7 3.7-4 3.7s-4-1.7-4-3.7z" {...strokeProps} />
        </>
      )}
      {glyph === "swim" && (
        <>
          <Circle cx="7.2" cy="8.2" r="1.6" {...strokeProps} />
          <Path d="M9.2 10.2l3.6 1.4c.8.3 1.5.2 2.2-.2l2.4-1.4" {...strokeProps} />
          <Path d="M3 15c1.1.9 2.2.9 3.3 0s2.2-.9 3.3 0 2.2.9 3.3 0 2.2-.9 3.3 0 2.2.9 3.3 0" {...strokeProps} />
        </>
      )}
      {glyph === "security" && (
        <>
          <Path d="M12 3.5l7 2.8v5.4c0 4.2-3 7.9-7 8.8-4-.9-7-4.6-7-8.8V6.3l7-2.8z" {...strokeProps} />
          <Path d="M9.7 11.7l1.6 1.6 3-3" {...strokeProps} />
        </>
      )}
      {glyph === "access" && (
        <>
          <Rect x="6" y="4.5" width="12" height="15" rx="2" {...strokeProps} />
          <Line x1="9" y1="12" x2="15" y2="12" {...strokeProps} />
          <Polyline points="10.5,9.5 9,8 7.5,9.5" {...strokeProps} />
          <Polyline points="13.5,14.5 15,16 16.5,14.5" {...strokeProps} />
        </>
      )}
      {glyph === "workspace" && (
        <>
          <Rect x="4.5" y="6.5" width="15" height="11" rx="1.8" {...strokeProps} />
          <Path d="M9 6.5v-1A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v1" {...strokeProps} />
          <Line x1="4.5" y1="11" x2="19.5" y2="11" {...strokeProps} />
        </>
      )}
      {glyph === "screen" && (
        <>
          <Rect x="3.8" y="5.5" width="16.4" height="10.5" rx="1.6" {...strokeProps} />
          <Line x1="9" y1="19" x2="15" y2="19" {...strokeProps} />
          <Line x1="12" y1="16" x2="12" y2="19" {...strokeProps} />
        </>
      )}
      {glyph === "outdoor" && (
        <>
          <Path d="M12 18.5V10.5" {...strokeProps} />
          <Path d="M12 10.5c0-2.4 2-4.3 4.4-4.3-.2 2.5-2.1 4.3-4.4 4.3z" {...strokeProps} />
          <Path d="M12 12.5c0-2.3-1.8-4.2-4.2-4.2.2 2.4 1.9 4.2 4.2 4.2z" {...strokeProps} />
          <Line x1="8.5" y1="18.5" x2="15.5" y2="18.5" {...strokeProps} />
        </>
      )}
      {glyph === "kitchen" && (
        <>
          <Rect x="5" y="4.5" width="14" height="15" rx="2" {...strokeProps} />
          <Line x1="5" y1="9.5" x2="19" y2="9.5" {...strokeProps} />
          <Circle cx="9" cy="14.2" r="1.4" {...strokeProps} />
          <Circle cx="15" cy="14.2" r="1.4" {...strokeProps} />
        </>
      )}
      {glyph === "info" && (
        <>
          <Circle cx="12" cy="12" r="8.5" {...strokeProps} />
          <Line x1="12" y1="11" x2="12" y2="16" {...strokeProps} />
          <Circle cx="12" cy="8" r="0.9" fill={color} />
        </>
      )}
    </Svg>
  );
};

export default FacilityIcon;
