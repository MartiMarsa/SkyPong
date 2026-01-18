import { useState } from "react";
import { l } from '../lib/i18n/localizer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importas SOLO el icono que vas a usar
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { on } from "events";


export default function PlayButtonUI( { onClick, isModalOpen } ) 
{
    return (
        <button onClick={ () => onClick(false) } className="
        flex flex-row justify-center align-center 
        leading-none gap-4 play-button-ui uppercase mt-4 
        self-center px-6 py-3 bg-yellow-400 text-white 
        rounded-lg hover:bg-yellow-500 transition-colors 
        w-md text-yellow-900 font-bold { isModalOpen ? 'appear' : '' }">
            <FontAwesomeIcon icon={faGamepad} />
            {l('game.playButton')}
        </button>
    );
}