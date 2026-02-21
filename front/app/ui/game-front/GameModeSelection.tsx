import { useTranslation } from '../hooks/use-translation';

export default function GameModeSelection({ onSelectAI, onSelectMultiplayer })
{
    const { t } = useTranslation();

    return (
        <section className="game-mode-selection">
            <h1>{t.game.chooseMode}</h1>

            <div>
                <button onClick={onSelectAI}>
                    {t.game.singlePlayer}
                </button>

                <button onClick={onSelectMultiplayer}>
                    {t.game.multiplayer}
                </button>
            </div>
        </section>
    );
}