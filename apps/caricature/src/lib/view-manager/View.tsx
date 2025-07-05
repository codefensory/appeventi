import useViewStore from "./view-manager-store";
import { motion, AnimatePresence, MotionStyle } from "framer-motion";

interface ViewProps {
  viewId: string;
  children: React.ReactNode;
  style?: MotionStyle;
}

const View: React.FC<ViewProps> = ({ viewId, style, children }) => {
  const currentView = useViewStore((state) => state.currentView);

  const isVisible = currentView === viewId;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          style={style}
          key={viewId}
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          initial={{
            x: "100%",
            scale: 0.85,
            borderRadius: "48px",
          }}
          animate={{
            x: 0,
            scale: 1,
            borderRadius: "0px",
            transition: {
              x: {
                delay: 0.3,
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              },
              scale: {
                delay: 0.6,
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              },
              borderRadius: {
                delay: 0.6,
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              },
            },
          }}
          exit={{
            scale: [1, 0.85],
            borderRadius: [0, "48px", "48px"],
            x: [0, 0, "-100%"],
            transition: {
              duration: 0.6,
            },
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default View;
