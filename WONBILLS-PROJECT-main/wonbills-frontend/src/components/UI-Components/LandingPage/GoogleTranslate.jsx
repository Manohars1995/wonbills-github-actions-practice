// import { useEffect, useRef, useState } from "react";
// import { useLanguage } from "./LanguageContext";

// const languages = [
//   { code: "en",    label: "EN - English",    flag: "🇺🇸" },
//   { code: "es",    label: "ES - Spanish",    flag: "🇪🇸" },
//   { code: "fr",    label: "FR - French",     flag: "🇫🇷" },
//   { code: "ar",    label: "AR - Arabic",     flag: "🇸🇦" },
//   { code: "pt",    label: "PT - Portuguese", flag: "🇵🇹" },
//   { code: "de",    label: "DE - German",     flag: "🇩🇪" },
//   { code: "hi",    label: "HI - Hindi",      flag: "🇮🇳" },
//   { code: "ja",    label: "JA - Japanese",   flag: "🇯🇵" },
//   { code: "ru",    label: "RU - Russian",    flag: "🇷🇺" },
//   { code: "zh-CN", label: "ZH - Chinese",    flag: "🇨🇳" },
// ];

// const GoogleTranslate = () => {
//   const { language: selected, setLanguage: setSelected } = useLanguage();
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     if (!document.getElementById("google_translate_element")) {
//       const div = document.createElement("div");
//       div.id = "google_translate_element";
//       div.style.display = "none";
//       document.body.appendChild(div);
//     }

//     if (!document.getElementById("gt-script")) {
//       const script = document.createElement("script");
//       script.id = "gt-script";
//       script.src =
//         "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//       script.async = true;
//       document.body.appendChild(script);
//     }

//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           includedLanguages: "en,es,fr,ar,pt,de,hi,ja,ru,zh-CN",
//           autoDisplay: false,
//         },
//         "google_translate_element"
//       );
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const changeLanguage = (lang) => {
//     setSelected(lang);
//     setOpen(false);
//     const select = document.querySelector(".goog-te-combo");
//     if (select) {
//       select.value = lang.code;
//       select.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   };

//   return (
//     <div ref={dropdownRef} className="relative">
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg transition-colors"
//       >
//         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//           <circle cx="12" cy="12" r="10" />
//           <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
//         </svg>
//         <span>{selected.code.toUpperCase()}</span>
//         <svg
//           className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
//           fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
//           {languages.map((lang) => (
//             <button
//               key={lang.code}
//               onClick={() => changeLanguage(lang)}
//               className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors
//                 ${selected.code === lang.code
//                   ? "bg-blue-50 text-blue-600 font-semibold"
//                   : "text-gray-700 hover:bg-gray-50"
//                 }`}
//             >
//               <span>{lang.flag}</span>
//               <span>{lang.label}</span>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GoogleTranslate;

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";

const languages = [
  { code: "en",    label: "EN - English",    flag: "🇺🇸" },
  { code: "es",    label: "ES - Spanish",    flag: "🇪🇸" },
  { code: "fr",    label: "FR - French",     flag: "🇫🇷" },
  { code: "ar",    label: "AR - Arabic",     flag: "🇸🇦" },
  { code: "pt",    label: "PT - Portuguese", flag: "🇵🇹" },
  { code: "de",    label: "DE - German",     flag: "🇩🇪" },
  { code: "hi",    label: "HI - Hindi",      flag: "🇮🇳" },
  { code: "ja",    label: "JA - Japanese",   flag: "🇯🇵" },
  { code: "ru",    label: "RU - Russian",    flag: "🇷🇺" },
  { code: "zh-CN", label: "ZH - Chinese",    flag: "🇨🇳" },
];

const GoogleTranslate = () => {
  const { language: selected, setLanguage: setSelected } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ← CHANGED: clears Google Translate's cookie so it can't auto-restore
  // a previously selected language on refresh. Forces English every load.
  const resetToEnglish = () => {
    const hostname = window.location.hostname;
    // Clear on root path and current path, with and without domain,
    // since Google sets this cookie inconsistently across setups.
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
    setSelected(languages[0]); // reset React state to English too
  };

  useEffect(() => {
    resetToEnglish(); // ← CHANGED: run before widget initializes, every mount

    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    if (!document.getElementById("gt-script")) {
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,fr,ar,pt,de,hi,ja,ru,zh-CN",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    setSelected(lang);
    setOpen(false);
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  return (
    <div ref={dropdownRef} className="relative" translate="no">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{selected.code.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors
                ${selected.code === lang.code
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;