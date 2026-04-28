'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (booting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center font-mono p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#00ff00] text-xs space-y-1"
          >
            <p>&gt; GITPILOT_CORE_V1.0.4_LOAD...</p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              &gt; AUTH_TOKEN_VALIDATING... [OK]
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              &gt; DATABASE_CONNECTING... [OK]
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              &gt; CACHE_SYNC_INITIALIZING...
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="h-1 bg-[#00ff00] mt-4"
            />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
              &gt; READY_FOR_INPUT.
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
