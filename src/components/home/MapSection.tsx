type MapSectionProps = {
  className?: string;
};

export default function MapSection({
  className = "bg-paper",
}: MapSectionProps) {
  return (
    <section id="location" className={`w-full ${className}`}>
      <iframe
        title="Nirvana Yoga School — Tapovan, Rishikesh"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958!2d78.317539!3d30.134671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390917086b26bdc1%3A0x2b53a8c169c9e93c!2sNirvana%20Yoga%20School!5e1!3m2!1sen!2sin!4v1718600000000!5m2!1sen!2sin"
        className="w-full border-0"
        style={{ minHeight: 500, height: "50vh" }}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </section>
  );
}
