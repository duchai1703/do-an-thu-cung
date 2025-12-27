"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Only pass activeTab and onTabChange to TabsList and TabsContent
          const childType = child.type?.displayName;
          if (childType === 'TabsList' || childType === 'TabsContent') {
            return React.cloneElement(child, {
              activeTab,
              onTabChange: handleTabChange,
            });
          }
        }
        return child;
      })}
    </div>
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className, activeTab, onTabChange, children, ...props }, ref) => {
  // Remove activeTab and onTabChange from props to prevent passing to DOM
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange,
          });
        }
        return child;
      })}
    </div>
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, activeTab, onTabChange, children, ...props }, ref) => {
  const isActive = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/50",
        className
      )}
      onClick={() => onTabChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, value, activeTab, children, ...props }, ref) => {
  if (activeTab !== value) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

