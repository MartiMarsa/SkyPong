const resolutions = { mobile: 430, tablet: 744 }

export default function SelectStyles (mobileStyles, desktopStyles, from = "tablet")
{
    const resolution = window.screen.availWidth;
    const device = (from === "tablet") ? resolution.tablet : match = resolution.mobile;

    return ( resolution <= device ) ? mobileStyles : desktopStyles;
}