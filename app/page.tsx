import HeroSection from "../components/custom/HeroSection";
import { FeaturedProperties } from "../components/custom/FeaturedProperties";
import { fetchFeaturedPropertiesByCategory, fetchFeaturedExperiences, fetchFeaturedTestimonials } from "@/lib/data";

import { FeaturedExperiences } from "@/components/custom/FeaturedExperiences";
import { FeaturedTestimonials } from "@/components/custom/FeaturedTestimonials";
import HomeAboutSection from "@/components/custom/HomeAboutSection";

export default async function Home() {
  // Fetch featured properties and experiences in parallel
  const [
    featuredVerde,
    featuredAzul,
    featuredCeleste,
    featuredExperiences,
    featuredTestimonials,
  ] = await Promise.all([
    fetchFeaturedPropertiesByCategory('Verde', 6),
    fetchFeaturedPropertiesByCategory('Azul', 6),
    fetchFeaturedPropertiesByCategory('Celeste', 6),
    fetchFeaturedExperiences(4),
    fetchFeaturedTestimonials(),
  ]);

  return (
    <main>
      <HeroSection
        videoSrc="/video-hero.mp4"
        title="Una experiencia exclusiva en cada Chalet"
        subtitle="Naturaleza y confort en Chumamaya Country Club"
      />


      {/* Section for 'Azul' category */}
      {featuredAzul.length > 0 && (
        <div className="py-12 bg-gray-50">
          <FeaturedProperties title="Chalets Azules" properties={featuredAzul} />
        </div>
      )}

      {/* Section for 'Celeste' category */}
      {featuredCeleste.length > 0 && (
        <div className="py-12">
          <FeaturedProperties title="Chalets Celestes" properties={featuredCeleste} />
        </div>
      )}

      {/* Section for 'Verde' category */}
      {featuredVerde.length > 0 && (
        <div className="py-12">
          <FeaturedProperties title="Chalets Verdes" properties={featuredVerde} />
        </div>
      )}

      {/* Section for Featured Experiences */}
      {featuredExperiences.length > 0 && (
        <div className="py-12 bg-gray-50">
          <FeaturedExperiences title="Experiencias Destacadas" experiences={featuredExperiences} />
        </div>
      )}

      {/* About Section */}
      <HomeAboutSection />

      {/* Section for Featured Testimonials */}
      {featuredTestimonials.length > 0 && (
        <div className="py-12">
          <FeaturedTestimonials testimonials={featuredTestimonials} />
        </div>
      )}
    </main>
  );
}
