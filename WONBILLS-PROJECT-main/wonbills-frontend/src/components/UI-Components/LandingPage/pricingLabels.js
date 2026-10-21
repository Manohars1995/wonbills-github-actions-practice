// Static translations for the few strings that change on Monthly/Yearly toggle.
// Google Translate cannot safely handle these because React re-renders them,
// so they're translated manually here instead, keyed by language.code.
export const PRICING_LABELS = {
  en: { monthly: "Monthly", yearly: "Yearly", startsFrom: "Starts from", perMonth: "/month", perYear: "/year", save: "Save up to 17%" },
  es: { monthly: "Mensual", yearly: "Anual", startsFrom: "Desde", perMonth: "/mes", perYear: "/año", save: "Ahorra hasta 17%" },
  fr: { monthly: "Mensuel", yearly: "Annuel", startsFrom: "À partir de", perMonth: "/mois", perYear: "/an", save: "Économisez jusqu'à 17%" },
  ar: { monthly: "شهري", yearly: "سنوي", startsFrom: "يبدأ من", perMonth: "/شهر", perYear: "/سنة", save: "وفّر حتى 17%" },
  pt: { monthly: "Mensal", yearly: "Anual", startsFrom: "A partir de", perMonth: "/mês", perYear: "/ano", save: "Economize até 17%" },
  de: { monthly: "Monatlich", yearly: "Jährlich", startsFrom: "Ab", perMonth: "/Monat", perYear: "/Jahr", save: "Bis zu 17% sparen" },
  hi: { monthly: "मासिक", yearly: "वार्षिक", startsFrom: "शुरुआती कीमत", perMonth: "/माह", perYear: "/वर्ष", save: "17% तक बचाएं" },
  ja: { monthly: "月払い", yearly: "年払い", startsFrom: "最低料金", perMonth: "/月", perYear: "/年", save: "最大17%お得" },
  ru: { monthly: "Ежемесячно", yearly: "Ежегодно", startsFrom: "От", perMonth: "/месяц", perYear: "/год", save: "Скидка до 17%" },
  "zh-CN": { monthly: "月付", yearly: "年付", startsFrom: "起价", perMonth: "/月", perYear: "/年", save: "最高节省17%" },
};

export function getPricingLabels(langCode) {
  return PRICING_LABELS[langCode] || PRICING_LABELS.en;
}