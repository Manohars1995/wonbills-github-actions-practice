import React from 'react';
import Accordion from '../../UI-Elements/Accordion';

const FAQ_LIST = [
    {
        question: "Does WON BILLS have a referral program?",
        answer:
            "Yes! WON BILLS offers a referral program where you can earn rewards for referring new users. When someone you refer signs up and uses the app, both you and the new user can benefit from exclusive discounts or bonuses."
    },
    {
        question: "Can I include tax on my invoices in WON BILLS?",
        answer:
            "Yes, WON BILLS allows you to include taxes on your invoices, ensuring accurate billing. You can customize each invoice to reflect your specific tax requirements."
    },
    {
        question: "Can I schedule invoices with WON BILLS?",
        answer:
            "Yes! WON BILLS allows you to automate and schedule invoices, saving you time on repetitive tasks."
    },
    {
        question: "Can I customise my invoices?",
        answer:
            "Yes! WON BILLS offers personalised invoice templates, allowing you to add your logo, branding, and specific details."
    },
    {
        question: "Is customer data secure in WON BILLS?",
        answer:
            "Yes, customer data is protected with robust security measures, ensuring compliance with privacy regulations and safe data handling."
    },
    {
        question: "Can clients pay directly through WON BILLS?",
        answer:
            "Yes, WON BILLS supports multiple payment methods, allowing clients to pay directly through the invoice payment link."
    }
];


const Faqs = () => {
    return (
        <section>
            <Accordion title="FAQ'S">
                <ul className="space-y-3 sm:space-y-4">
                    {FAQ_LIST.map((faq, index) => (
                        <li
                            key={index}
                            className="
                            bg-blue-100
                            p-3 sm:p-4
                            rounded-2xl
                        "
                        >
                            <strong className="block text-sm sm:text-base font-bold text-black">
                                {faq.question}
                            </strong>

                            <p className="mt-1 text-sm sm:text-base text-gray-500 leading-relaxed">
                                {faq.answer}
                            </p>
                        </li>
                    ))}
                </ul>
            </Accordion>
        </section>
    );

}

export default React.memo(Faqs);
