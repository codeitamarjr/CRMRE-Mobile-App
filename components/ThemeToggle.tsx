import { memo, useMemo } from "react";
import { Switch } from "react-native";
import { useGlobalContext } from "@/lib/global-provide";

const ThemeToggleComponent = () => {
  const { theme, setTheme } = useGlobalContext();
  const isDark = theme === "dark";

  const trackColor = useMemo(
    () => ({
      false: "#CBD5F5",
      true: "#1E293B",
    }),
    []
  );

  return (
    <Switch
      value={isDark}
      onValueChange={(value) => setTheme(value ? "dark" : "light")}
      trackColor={trackColor}
      thumbColor={isDark ? "#0061FF" : "#F4F3F5"}
      ios_backgroundColor="#CBD5F5"
    />
  );
};

const ThemeToggle = memo(ThemeToggleComponent);

export default ThemeToggle;
