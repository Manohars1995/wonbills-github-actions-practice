import Template1 from "../Templates/Template1";
import Template2 from "../Templates/Template2";
import Template3 from "../Templates/Template3";

const TEMPLATE_MAP = {
    1: Template1,
    2: Template2,
    3: Template3
};

export const resolveInvoiceTemplate = (key) => {
    return TEMPLATE_MAP[key] || Template1; // safe fallback
};
