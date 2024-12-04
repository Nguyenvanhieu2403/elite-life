'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import Script from 'next/script';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="google-adsense-account" content="ca-pub-2186867553216325">
                </meta>
                <link
                    id="theme-css"
                    href={`/themes/lara-light-indigo/theme.css`}
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* Google Tag Manager */}
                <Script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-NB2CVK98W2"
                ></Script>
                <Script id="google-analytics">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-NB2CVK98W2');
                    `}
                </Script>
                {/* End Google Tag Manager */}

                {/* Google Tag Manager */}
                <Script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-DLTWC4WBZX"
                ></Script>
                <Script id="google-analytics">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-DLTWC4WBZX');
                    `}
                </Script>
                {/* End Google Tag Manager */}

                {/* Google AdSense */}
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2186867553216325"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                {/* End Google AdSense */}
                <PrimeReactProvider>
                    <LayoutProvider>{children}</LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
