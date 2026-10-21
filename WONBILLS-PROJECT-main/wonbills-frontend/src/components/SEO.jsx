// src/components/SEO.jsx

import { Helmet } from "react-helmet-async";

const SEO = ({
    title = "Your App Name",
    description = "Online billing and invoice management software.",
    keywords = "billing software, invoice software",
    canonical = window.location.href,
    image = "/og-banner.png",
    type = "website",
    noIndex = false,
}) => {

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "WonBills",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description,
        url: canonical,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
        },
    };

    return (
        <Helmet>
            {/* Primary Meta */}
            <title>{`${title} | WonBills`}</title>

            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {noIndex && (
                <meta name="robots" content="noindex,nofollow" />
            )}

            <link rel="canonical" href={canonical} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;