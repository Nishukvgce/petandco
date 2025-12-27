import React, { useRef, useState } from 'react';

const DogBanner = () => {
	const videoRef = useRef(null);
	const [muted, setMuted] = useState(true);

	const toggleMute = () => {
		const v = videoRef.current;
		if (!v) return;
		v.muted = !v.muted;
		setMuted(v.muted);
		if (!v.muted) {
			v.play().catch(() => {});
		}
	};

	return (
		<section className="py-6">
			<div className="container mx-auto px-4">
				<div className="flex items-center gap-4">
					<div className="w-40 h-28 lg:w-56 lg:h-36 overflow-hidden rounded-lg bg-gray-100 shadow-sm flex-shrink-0">
						<video
							ref={videoRef}
							src="/assets/images/banners/dog.mp4"
							className="w-full h-full object-cover"
							autoPlay
							loop
							playsInline
							muted
						/>
					</div>

					<div className="flex-1">
						<h3 className={`text-lg lg:text-xl font-semibold ${!muted ? 'text-black' : 'text-gray-900'}`}>
							Dog Picks — Quick Look
						</h3>
						<p className={`text-sm mt-1 ${!muted ? 'text-black' : 'text-gray-700'}`}>
							A small preview of our dog collection for Winter'25.
						</p>
						<div className="mt-3">
							<button
								onClick={toggleMute}
								aria-pressed={!muted}
								aria-label={muted ? 'Unmute video' : 'Mute video'}
								className="inline-flex items-center gap-2 bg-white/90 text-gray-900 px-3 py-1 rounded-lg text-sm font-medium"
							>
								{muted ? 'Unmute' : 'Mute'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DogBanner;
