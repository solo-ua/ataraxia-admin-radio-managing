import React, { useState, useEffect } from 'react';
import './css/filler.css'
const Filler = () => {
  const tips = [
    " The first metal album to ever play on the radio was Black Sabbath’s debut in 1970. (A fun fact you could've lived without!)",
    "Tip: Ensure your radio's API endpoint is publicly accessible. We can’t fetch what you’re hiding!",
    "Pro Tip: Album cover images should be at least 300x300 pixels for optimal display quality.",
    "Did you know? Some stations don't bother with album cover metadata. If yours has none, don't stress it! We got you 𝘤𝘰𝘷𝘦𝘳𝘦𝘥 ;)",
    "Tip: Avoid streams that have DRM (Digital Rights Management)—we like our radios free and open.",
    " Metadata is king! If your stream lacks artist/title info, you’re losing listeners.",
    "Pro Tip: Use radio station APIs that refresh metadata every 5-10 seconds for up-to-date track info.",
    "Coming soon: No need to manually check the metadata paths of a station's song, let us handle this 𝘱𝘢𝘵𝘩.",
    "Did you know? You can submit a radio station even if it has just one stream. Quality over quantity.",
    " The album cover for Iron Maiden’s ‘Somewhere in Time’ has over 30 Easter eggs referencing their past songs.",
    "Did you know? Listening to radios with obscure genres can make you 200% cooler. (Totally not proven.)",
    "Tip: Hit the 'Validate Url' button to test the station stream link to ensure it works.",
    "Pro Tip: Submit stations with multiple bitrates! It’s a blessing for users with slower connections, like me!",
    " The most-played alternative track of all time on online radio is Joy Division’s 'Love Will Tear Us Apart'. Ever heard of it? Me neither.",
    "Did you know? Online radios account for 15% of global music consumption. Let’s be unrealistic and grow that pie!",
    " Some radio hosts use Raspberry Pi to run their stations. Low-cost and nerd-approved! (Wait... what do nerds have to do with this?)",
    "Tip: Want your station to stand out? Add descriptive tags like genre, mood, or location. Or start a steamy scandal surrounding your stream!",
    "Did you know? Radio stations with better metadata retention have higher user engagement rates. So please include album cover images :')",
    "Pro Tip: Provide a fallback stream URL for when your main server goes down. Downtime sucks.",
    "Comping up with more tips...",
    " Submitting a station through our radio manager is easier than punching a child. No excuses!",
    "Did you know? Indie radio stations in Iceland often stream both post-rock and death metal back-to-back. Versatile vibes!",
    "Tip: Streaming darkwave? Use mysterious or moody album art for extra atmospheric effect ;)",
    "We care about the neglected niche fans! Submit radio stations with a focus on regional alt-genres, like German industrial or Swedish death metal.",
    "Discovered a stink bug? Contact us asap!",
    "Did you know? Finland has the most metal bands per capita. Add their stations to give Ataraxia a global metal edge!",
    " The goth scene has some of the most loyal listeners. A well-tagged station will keep them tuned in for hours.",
    "Tip: Death metal radios with dynamic album art tend to attract listeners who love discovering new bands. And me, the author of this tip, is the living proof of that.",
    " Many radio stations still use vinyl rips for classic punk and metal tracks—it’s a raw experience for audiophiles.",
    "Pro Tip: Radio stations playing emo and indie tracks often pair well with introspective listener testimonials. Bonus content, anyone?",
    "Did you know? Alternative radios in the US often stream underground artists from Eastern Europe. Cultural crossover FTW!",
    " The loudness war is real—some metal stations master their streams louder than mainstream pop. Prepare for impact!",
    "Tip: Darkwave listeners tend to appreciate curated playlists with storytelling themes. Keep that in mind when submitting.",
    " The alternative scene has some of the most diverse subgenres. From post-punk to sludge metal, there’s always more to discover.",
    "Did you know? A good punk radio station can turn any boring commute into a personal rebellion anthem."
  ];

  const [currentTip, setCurrentTip] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    let previousIndex = 0;
    const interval = setInterval(() => {
      setIsSwiping(true); // Trigger the swipe-out animation
      setTimeout(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * tips.length); // Generate a new index
            } while (newIndex === previousIndex); // Avoid immediate repetition
            previousIndex = newIndex;
        setCurrentTip(tips[newIndex]); // update next tip
        setIsSwiping(false); // trigger the swipe in
      }, 800); // Match the animation duration
    }, 7000); // Change every 7 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tips]);

  return (
    <div className="filler-container">
      <p className={`tips ${isSwiping ? 'swipe-out' : 'swipe-in'}`}>{currentTip}</p>
    </div>
  );
};

export default Filler;