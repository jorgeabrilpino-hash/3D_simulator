'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { useSimulatorStore } from '@/store/simulatorStore'

export function FeedbackToast() {
  const feedbackToast = useSimulatorStore((state) => state.feedbackToast)
  const cerrarFeedbackToast = useSimulatorStore((state) => state.cerrarFeedbackToast)

  return (
    <AnimatePresence>
      {feedbackToast?.visible && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-2xl p-4"
        >
          <div className="rounded-lg border border-white/10 bg-[#111111] p-5 shadow-2xl shadow-black/60">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Consecuencia de tu decision
            </p>
            <p className="text-sm leading-relaxed text-zinc-100">{feedbackToast.texto}</p>
            <motion.div
              className="mt-4 h-0.5 origin-left rounded-full bg-zinc-500"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
              onAnimationComplete={cerrarFeedbackToast}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
