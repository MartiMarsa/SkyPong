

export default function HeroUI({ title, subtitle, imageUrl, isModalOpen })
{
    return (
        <section className={`hero-ui ${isModalOpen ? "basis-1/2" : ""} flex flex-col justify-center items-center mb-8`}>
            <div className="hero-content">
                <h1 className="hero-title text-4xl font-bold mb-4 text-center">{title}</h1>
                <p className="hero-subtitle text-lg text-center">{subtitle}</p>
            </div>
            {imageUrl && (
                <div className="hero-image">
                    <img src={imageUrl} alt="Hero Image" />
                </div>
            )}
        </section>
    );
}