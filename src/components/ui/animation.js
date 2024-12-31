
export const float = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const glow = {
  initial: { 
    textShadow: "0 0 0 rgba(168, 85, 247, 0)",
    boxShadow: "0 0 0 rgba(168, 85, 247, 0)"
  },
  animate: {
    textShadow: [
      "0 0 20px rgba(168, 85, 247, 0.5)",
      "0 0 40px rgba(168, 85, 247, 0.3)",
      "0 0 20px rgba(168, 85, 247, 0.5)"
    ],
    boxShadow: [
      "0 0 20px rgba(168, 85, 247, 0.2)",
      "0 0 40px rgba(168, 85, 247, 0.1)",
      "0 0 20px rgba(168, 85, 247, 0.2)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

