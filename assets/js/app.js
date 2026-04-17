const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsObserver = "IntersectionObserver" in window;
const motionEnabled = !prefersReducedMotion && supportsObserver;

const revealElements = document.querySelectorAll(".reveal");
const navSections = document.querySelectorAll("[data-section]");
const motionSections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll('.topnav a[href^="#"]');
const topbar = document.querySelector(".topbar");
const yearNode = document.querySelector("[data-current-year]");
const root = document.documentElement;
const body = document.body;

if (motionEnabled) {
    body.classList.add("has-motion");
}

if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
}

const setStaggerIndexes = (selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
        element.style.setProperty("--stagger-index", String(index));
    });
};

[
    ".hero__panel .step-chip",
    ".hero__panel .pulse-note",
    ".contact__panel .message-box",
    ".contact__panel .contact__meta article",
    ".table-shell .compare-table tbody tr",
].forEach(setStaggerIndexes);

const setTopbarState = () => {
    if (topbar) {
        topbar.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
};

let scrollFrame = null;
const onScroll = () => {
    if (scrollFrame !== null) {
        return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
        setTopbarState();
        scrollFrame = null;
    });
};

setTopbarState();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", setTopbarState, { passive: true });

const revealAll = () => {
    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });

    motionSections.forEach((section) => {
        section.classList.add("section--active");
    });
};

if (!motionEnabled) {
    revealAll();
} else {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -10% 0px",
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

    const motionSectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("section--active");
                motionSectionObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.18,
            rootMargin: "0px 0px -18% 0px",
        }
    );

    motionSections.forEach((section) => {
        motionSectionObserver.observe(section);
    });
}

if (navLinks.length > 0 && navSections.length > 0 && supportsObserver) {
    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${id}`;
            if (active) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleSection = entries
                .filter((entry) => entry.isIntersecting)
                .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

            if (!visibleSection || !visibleSection.target.id) {
                return;
            }

            setActiveLink(visibleSection.target.id);
        },
        {
            threshold: [0.25, 0.45, 0.7],
            rootMargin: "-20% 0px -55% 0px",
        }
    );

    navSections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

const inquiryForm = document.getElementById("inquiry-form");
if (inquiryForm) {
    inquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(inquiryForm);
        const jobType = data.get("job-type") || "";
        const budget = data.get("budget") || "";
        const name = data.get("name") || "";
        const phone = data.get("phone") || "";

        if (!jobType || !name || !phone) {
            const firstEmpty = inquiryForm.querySelector(
                "input:required:placeholder-shown, select:required"
            );

            const empties = inquiryForm.querySelectorAll(
                "input:required, select[required]"
            );

            empties.forEach((field) => {
                const val = field.value.trim();
                if (!val) {
                    field.style.borderColor = "rgba(240, 255, 113, 0.55)";
                    field.style.boxShadow = "0 0 0 3px rgba(240, 255, 113, 0.1)";
                    field.addEventListener(
                        "input",
                        () => {
                            field.style.borderColor = "";
                            field.style.boxShadow = "";
                        },
                        { once: true }
                    );
                }
            });

            const firstInvalid = Array.from(empties).find((f) => !f.value.trim());
            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        const lines = [
            "สวัสดีครับ/ค่ะ",
            "",
            "ขอสอบถามราคางานดังนี้",
            "ประเภทงาน: " + jobType,
            budget ? "งบประมาณ: " + budget : null,
            "",
            "ชื่อ: " + name,
            "เบอร์ติดต่อ: " + phone,
            "",
            "กรุณาช่วยติดต่อกลับด้วยครับ/ค่ะ",
        ]
            .filter((line) => line !== null)
            .join("\n");

        const subject = encodeURIComponent("สอบถามราคา: " + jobType);
        const body = encodeURIComponent(lines);

        const submitBtn = inquiryForm.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "กำลังเปิดอีเมล…";

        window.location.href =
            "mailto:keriyngkir2224@gmail.com?subject=" + subject + "&body=" + body;

        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 2400);
        });
    });
}

/* ── Hamburger / mobile menu ──────────────────────────────── */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

if (hamburger && mobileMenu) {
    const openMenu = () => {
        hamburger.classList.add("is-open");
        hamburger.setAttribute("aria-expanded", "true");
        hamburger.setAttribute("aria-label", "ปิดเมนู");
        mobileMenu.classList.add("is-open");
        mobileMenu.setAttribute("aria-hidden", "false");
    };

    const closeMenu = () => {
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "เปิดเมนู");
        mobileMenu.classList.remove("is-open");
        mobileMenu.setAttribute("aria-hidden", "true");
    };

    hamburger.addEventListener("click", () => {
        if (hamburger.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close when a nav link is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // Close on outside click
    document.addEventListener("click", (event) => {
        if (
            mobileMenu.classList.contains("is-open") &&
            !mobileMenu.contains(event.target) &&
            !hamburger.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Close on Escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
            closeMenu();
            hamburger.focus();
        }
    });

    // Close menu on resize to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    }, { passive: true });
}