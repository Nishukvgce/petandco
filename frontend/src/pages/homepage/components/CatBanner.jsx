import React from 'react';

const CatBanner = () => {
	return (
		<section className="py-8 lg:py-12 bg-[#ffe7d0]">
			<div className="container mx-auto px-4">
				<div className="rounded-2xl overflow-hidden shadow-md bg-white/95 flex items-center gap-6 p-4 lg:p-6">
					<div className="w-40 h-28 lg:w-64 lg:h-40 flex-shrink-0">
						<video
							src="/assets/images/banners/cat.mp4"
							className="w-full h-full object-cover rounded"
							autoPlay
							muted
							loop
							playsInline
						>
							<img src="/assets/images/banners/meowsi_web.png" alt="Cats at PET&CO" />
						</video>
					</div>

					<div>
						<h3 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">From the House of PET&CO</h3>
						<p className="text-lg text-muted-foreground mt-1">Purrfect picks for curious cats — curated essentials.</p>
						<div className="mt-3">
							<a
								href="/shop-for-cats"
								className="inline-block bg-[#ff7a00] text-white px-4 py-2 rounded-lg text-sm font-semibold"
							>
								Shop Cat Essentials
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CatBanner;
