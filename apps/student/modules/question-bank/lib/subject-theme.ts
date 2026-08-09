/**
 * subject-theme.ts
 *
 * Shared utility for resolving subject icons and Material-Design-3 accent
 * color tokens based on the subject name.  Extracted from the two view files
 * that previously each held their own copy.
 */
import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Languages,
  Laptop,
  Landmark,
  Globe,
  GraduationCap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface SubjectTheme {
  icon: LucideIcon
  accentColor: string
  watermarkColor: string
  iconBgColor: string
  borderColor: string
  hoverBg: string
  glowClass: string
}

/**
 * Intelligently resolves a contextual icon and MD-3 theme colors based on the
 * subject name (English or Bengali).  Falls back to a generic graduation cap.
 */
export function resolveSubjectTheme(
  nameEn: string = "",
  nameBn: string = ""
): SubjectTheme {
  const text = `${nameEn} ${nameBn}`.toLowerCase()

  if (text.includes("physic") || text.includes("পদার্থ")) {
    return {
      icon: Atom,
      accentColor: "text-primary",
      watermarkColor: "text-primary",
      iconBgColor: "bg-primary/10 text-primary dark:bg-primary/20",
      borderColor: "hover:border-primary/45",
      hoverBg: "hover:bg-primary/[0.02]",
      glowClass: "hover:shadow-primary/10",
    }
  }
  if (text.includes("chem") || text.includes("রসায়ন")) {
    return {
      icon: FlaskConical,
      accentColor: "text-secondary",
      watermarkColor: "text-secondary",
      iconBgColor: "bg-secondary/10 text-secondary dark:bg-secondary/20",
      borderColor: "hover:border-secondary/45",
      hoverBg: "hover:bg-secondary/[0.02]",
      glowClass: "hover:shadow-secondary/10",
    }
  }
  if (
    text.includes("math") ||
    text.includes("গণিত") ||
    text.includes("algebra") ||
    text.includes("calculus") ||
    text.includes("জ্যামিতি")
  ) {
    return {
      icon: Calculator,
      accentColor: "text-tertiary",
      watermarkColor: "text-tertiary",
      iconBgColor: "bg-tertiary/10 text-tertiary dark:bg-tertiary/20",
      borderColor: "hover:border-tertiary/45",
      hoverBg: "hover:bg-tertiary/[0.02]",
      glowClass: "hover:shadow-tertiary/10",
    }
  }
  if (
    text.includes("bio") ||
    text.includes("জীব") ||
    text.includes("botany") ||
    text.includes("zoology")
  ) {
    return {
      icon: Dna,
      accentColor: "text-[#15803d]",
      watermarkColor: "text-[#15803d]",
      iconBgColor: "bg-[#15803d]/10 text-[#15803d] dark:bg-[#15803d]/20",
      borderColor: "hover:border-[#15803d]/45",
      hoverBg: "hover:bg-[#15803d]/[0.02]",
      glowClass: "hover:shadow-[#15803d]/10",
    }
  }
  if (text.includes("english") || text.includes("ইংরেজি")) {
    return {
      icon: Languages,
      accentColor: "text-[#b91c1c]",
      watermarkColor: "text-[#b91c1c]",
      iconBgColor: "bg-[#b91c1c]/10 text-[#b91c1c] dark:bg-[#b91c1c]/20",
      borderColor: "hover:border-[#b91c1c]/45",
      hoverBg: "hover:bg-[#b91c1c]/[0.02]",
      glowClass: "hover:shadow-[#b91c1c]/10",
    }
  }
  if (
    text.includes("bangla") ||
    text.includes("bengali") ||
    text.includes("বাংলা") ||
    text.includes("সাহিত্য")
  ) {
    return {
      icon: BookOpen,
      accentColor: "text-[#c2410c]",
      watermarkColor: "text-[#c2410c]",
      iconBgColor: "bg-[#c2410c]/10 text-[#c2410c] dark:bg-[#c2410c]/20",
      borderColor: "hover:border-[#c2410c]/45",
      hoverBg: "hover:bg-[#c2410c]/[0.02]",
      glowClass: "hover:shadow-[#c2410c]/10",
    }
  }
  if (
    text.includes("ict") ||
    text.includes("computer") ||
    text.includes("কম্পিউটার") ||
    text.includes("তথ্য") ||
    text.includes("প্রযুক্তি")
  ) {
    return {
      icon: Laptop,
      accentColor: "text-[#0284c7]",
      watermarkColor: "text-[#0284c7]",
      iconBgColor: "bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20",
      borderColor: "hover:border-[#0284c7]/45",
      hoverBg: "hover:bg-[#0284c7]/[0.02]",
      glowClass: "hover:shadow-[#0284c7]/10",
    }
  }
  if (
    text.includes("account") ||
    text.includes("finance") ||
    text.includes("হিসাব") ||
    text.includes("ব্যবসায়") ||
    text.includes("ব্যবসা") ||
    text.includes("অর্থনীতি")
  ) {
    return {
      icon: Landmark,
      accentColor: "text-[#0d9488]",
      watermarkColor: "text-[#0d9488]",
      iconBgColor: "bg-[#0d9488]/10 text-[#0d9488] dark:bg-[#0d9488]/20",
      borderColor: "hover:border-[#0d9488]/45",
      hoverBg: "hover:bg-[#0d9488]/[0.02]",
      glowClass: "hover:shadow-[#0d9488]/10",
    }
  }
  if (
    text.includes("history") ||
    text.includes("ইতিহাস") ||
    text.includes("islam") ||
    text.includes("ইসলাম") ||
    text.includes("পৌরনীতি") ||
    text.includes("সমাজ")
  ) {
    return {
      icon: Globe,
      accentColor: "text-[#7c3aed]",
      watermarkColor: "text-[#7c3aed]",
      iconBgColor: "bg-[#7c3aed]/10 text-[#7c3aed] dark:bg-[#7c3aed]/20",
      borderColor: "hover:border-[#7c3aed]/45",
      hoverBg: "hover:bg-[#7c3aed]/[0.02]",
      glowClass: "hover:shadow-[#7c3aed]/10",
    }
  }

  return {
    icon: GraduationCap,
    accentColor: "text-primary",
    watermarkColor: "text-primary",
    iconBgColor: "bg-primary/10 text-primary dark:bg-primary/20",
    borderColor: "hover:border-primary/45",
    hoverBg: "hover:bg-primary/[0.02]",
    glowClass: "hover:shadow-primary/10",
  }
}
