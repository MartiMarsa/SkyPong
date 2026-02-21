"use client";

import { useTranslation } from '../../hooks/use-translation';

export default function GameLoader()
{
    const { t } = useTranslation();

    return (
        <section className="game-loader">
            <p>{t.common.loading}</p>
        </section>
    );
}