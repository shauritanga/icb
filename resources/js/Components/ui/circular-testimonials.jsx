import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function calculateGap(width) {
    const minWidth = 1024;
    const maxWidth = 1456;
    const minGap = 60;
    const maxGap = 86;

    if (width <= minWidth) return minGap;
    if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));

    return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function CircularTestimonials({
    testimonials,
    autoplay = true,
    colors = {},
    fontSizes = {},
}) {
    const colorName = colors.name ?? '#0d2545';
    const colorDesignation = colors.designation ?? '#64748b';
    const colorTestimony = colors.testimony ?? '#334155';
    const colorArrowBg = colors.arrowBackground ?? '#0d2545';
    const colorArrowFg = colors.arrowForeground ?? '#f8fafc';
    const colorArrowHoverBg = colors.arrowHoverBackground ?? '#f8c12c';
    const fontSizeName = fontSizes.name ?? '1.5rem';
    const fontSizeDesignation = fontSizes.designation ?? '0.925rem';
    const fontSizeQuote = fontSizes.quote ?? '1.125rem';

    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverPrev, setHoverPrev] = useState(false);
    const [hoverNext, setHoverNext] = useState(false);
    const [containerWidth, setContainerWidth] = useState(1200);

    const imageContainerRef = useRef(null);
    const autoplayIntervalRef = useRef(null);

    const testimonialsLength = testimonials.length;
    const activeTestimonial = useMemo(
        () => testimonials[activeIndex] ?? testimonials[0],
        [activeIndex, testimonials]
    );

    const handleNext = useCallback(() => {
        if (!testimonialsLength) return;

        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    }, [testimonialsLength]);

    const handlePrev = useCallback(() => {
        if (!testimonialsLength) return;

        setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
        if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    }, [testimonialsLength]);

    useEffect(() => {
        function handleResize() {
            if (imageContainerRef.current) {
                setContainerWidth(imageContainerRef.current.offsetWidth);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setActiveIndex(0);
    }, [testimonialsLength]);

    useEffect(() => {
        if (!autoplay || testimonialsLength < 2) return undefined;

        autoplayIntervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonialsLength);
        }, 5000);

        return () => {
            if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
        };
    }, [autoplay, testimonialsLength]);

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'ArrowLeft') handlePrev();
            if (event.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleNext, handlePrev]);

    function getImageStyle(index) {
        const gap = calculateGap(containerWidth);
        const maxStickUp = gap * 0.8;
        const isActive = index === activeIndex;
        const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
        const isRight = (activeIndex + 1) % testimonialsLength === index;

        if (isActive) {
            return {
                zIndex: 3,
                opacity: 1,
                pointerEvents: 'auto',
                transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)',
                transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
            };
        }

        if (isLeft) {
            return {
                zIndex: 2,
                opacity: 1,
                pointerEvents: 'auto',
                transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
                transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
            };
        }

        if (isRight) {
            return {
                zIndex: 2,
                opacity: 1,
                pointerEvents: 'auto',
                transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
                transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
            };
        }

        return {
            zIndex: 1,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
        };
    }

    if (!activeTestimonial) return null;

    const quoteVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                <div className="relative h-[22rem] w-full overflow-visible [perspective:1000px] sm:h-[25rem]" ref={imageContainerRef}>
                    {testimonials.map((testimonial, index) => (
                        <img
                            key={`${testimonial.name}-${index}`}
                            src={testimonial.src}
                            alt={testimonial.name}
                            className="absolute inset-0 h-full w-full rounded-lg object-cover object-top shadow-[0_18px_46px_rgba(14,49,90,0.18)]"
                            style={getImageStyle(index)}
                        />
                    ))}
                </div>

                <div className="flex min-h-[22rem] flex-col justify-between">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            variants={quoteVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <h3 className="mb-1 font-extrabold leading-tight" style={{ color: colorName, fontSize: fontSizeName }}>
                                {activeTestimonial.name}
                            </h3>
                            <p className="mb-7 font-semibold leading-snug" style={{ color: colorDesignation, fontSize: fontSizeDesignation }}>
                                {activeTestimonial.designation}
                            </p>
                            <motion.p className="leading-8" style={{ color: colorTestimony, fontSize: fontSizeQuote }}>
                                {activeTestimonial.quote.split(' ').map((word, index) => (
                                    <motion.span
                                        key={`${word}-${index}`}
                                        initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                                        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.22,
                                            ease: 'easeInOut',
                                            delay: 0.025 * index,
                                        }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {word}&nbsp;
                                    </motion.span>
                                ))}
                            </motion.p>
                        </motion.div>
                    </AnimatePresence>

                    {testimonialsLength > 1 && (
                        <div className="flex gap-4 pt-9 md:pt-6">
                            <button
                                className="grid h-11 w-11 place-items-center rounded-full border-0 transition-colors duration-300"
                                type="button"
                                onClick={handlePrev}
                                style={{ backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg }}
                                onMouseEnter={() => setHoverPrev(true)}
                                onMouseLeave={() => setHoverPrev(false)}
                                aria-label="Previous leader"
                            >
                                <ArrowLeft size={22} color={hoverPrev ? '#0d2545' : colorArrowFg} />
                            </button>
                            <button
                                className="grid h-11 w-11 place-items-center rounded-full border-0 transition-colors duration-300"
                                type="button"
                                onClick={handleNext}
                                style={{ backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg }}
                                onMouseEnter={() => setHoverNext(true)}
                                onMouseLeave={() => setHoverNext(false)}
                                aria-label="Next leader"
                            >
                                <ArrowRight size={22} color={hoverNext ? '#0d2545' : colorArrowFg} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CircularTestimonials;
