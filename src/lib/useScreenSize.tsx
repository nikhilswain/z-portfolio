import { useState, useEffect } from "react";

// Screen size breakpoints - you can adjust these based on your needs
const BREAKPOINTS = {
  mobile: 640, // < 640px
  tablet: 768, // 640px - 768px
  laptop: 1024, // 768px - 1024px
  desktop: 1280, // >= 1024px
};

// Custom hook to detect screen size
export const useScreenSize = () => {
  // Default to a reasonable size to avoid hydration issues
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  // Flag for each device type
  const [screenType, setScreenType] = useState({
    isMobile: false,
    isTablet: false,
    isLaptop: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Update screen type based on width
      const width = window.innerWidth;
      setScreenType({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isLaptop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop,
      });
    };

    // Add event listener
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      // Call handler right away to update state with initial window size
      handleResize();
    }

    // Remove event listener on cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []); // Empty array ensures effect runs only on mount and unmount

  return {
    ...windowSize,
    ...screenType,
    // Convenient helper functions
    isMobileOrTablet: screenType.isMobile || screenType.isTablet,
    isLaptopOrDesktop: screenType.isLaptop || screenType.isDesktop,
  };
};

// Higher-order component to conditionally render based on screen size
export const withScreenSize = (
  WrappedComponent: React.ComponentType<any>,
  {
    showOnMobile = true,
    showOnTablet = true,
    showOnLaptop = true,
    showOnDesktop = true,
  } = {}
) => {
  interface ScreenSizeProps {
    isMobile: boolean;
    isTablet: boolean;
    isLaptop: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
    isMobileOrTablet: boolean;
    isLaptopOrDesktop: boolean;
  }

  interface WithScreenSizeOptions {
    showOnMobile?: boolean;
    showOnTablet?: boolean;
    showOnLaptop?: boolean;
    showOnDesktop?: boolean;
  }

  type WrappedComponentProps = {
    screenSize: ScreenSizeProps;
    [key: string]: any;
  };

  return function WithScreenSize(
    props: Omit<WrappedComponentProps, "screenSize">
  ) {
    const screenSize = useScreenSize();

    // Return null if component should not be shown on current screen
    if (
      (screenSize.isMobile && !showOnMobile) ||
      (screenSize.isTablet && !showOnTablet) ||
      (screenSize.isLaptop && !showOnLaptop) ||
      (screenSize.isDesktop && !showOnDesktop)
    ) {
      return null;
    }

    return <WrappedComponent {...props} screenSize={screenSize} />;
  };
};

// Simpler component version for inline usage
interface ShowOnScreenSizeProps {
  children: React.ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  laptop?: boolean;
  desktop?: boolean;
}

export const ShowOnScreenSize = ({
  children,
  mobile = true,
  tablet = true,
  laptop = true,
  desktop = true,
}: ShowOnScreenSizeProps) => {
  const screenSize = useScreenSize();

  if (
    (screenSize.isMobile && !mobile) ||
    (screenSize.isTablet && !tablet) ||
    (screenSize.isLaptop && !laptop) ||
    (screenSize.isDesktop && !desktop)
  ) {
    return null;
  }

  return children;
};
