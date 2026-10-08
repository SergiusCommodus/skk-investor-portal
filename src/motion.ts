// One place for animation imports. `m` plus LazyMotion loads only the DOM animation features,
// which is a fraction of the full framer-motion bundle. `strict` throws if a full `motion.` tag sneaks in.
export { m as motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
