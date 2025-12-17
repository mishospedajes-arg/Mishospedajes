"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { H2, P } from "@/components/ui/typography";

const HomeAboutSection = () => {
    return (
        <div className="relative mt-20 shadow-md border-b w-full h-[500px] flex items-center justify-center">
            {/* Background Image - Mobile */}
            <div
                className="absolute inset-0 z-0 md:hidden"
                style={{
                    backgroundImage: "url('/home-nosotros-mobile.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Background Image - Desktop */}
            <div
                className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: "url('/home-nosotros.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="absolute top-[13%] md:top-[30%] text-center ml-0 md:ml-[40%] z-10 text-white px-4">
                <H2 className="text-white text-4xl leading-10 md:leading-2 pb-0">+25 años de trayectoria</H2>
                <P className="text-white/90 mb-7 text-md">
                    Acompañando experiencias auténticas
                </P>
                <Link href="/nosotros">
                    <Button size="lg" variant={"default"} className="text-black text-white hover:bg-primary/80 border-none">
                        Conoce Más
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HomeAboutSection;
