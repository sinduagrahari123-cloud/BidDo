import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

function LandingPage() {

    useGSAP(() => {

    const tl = gsap.timeline();

    tl.from(navbarRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
    })

    .from(".hero-title", {
        y: 70,
        opacity: 0,
        duration: 0.8,
    })

    .from(".hero-text", {
        opacity: 0,
        y: 30,
        duration: 0.6,
    })

    .from(".hero-btn", {
        opacity: 0,
        y: 20,
        stagger: 0.2,
        duration: 0.5,
    })

    .from(".feature-card", {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.6,
    });

});


    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    const heroRef = useRef();
const navbarRef = useRef();
const cardsRef = useRef();

    const [enterCode, setEnterCode] = useState('');

    const handleEnterRoom = (e) => {
        e.preventDefault();
        if (!enterCode.trim()) return;
        navigate(`/${enterCode.trim().toUpperCase()}`);
    };

    gsap.to(heroRef.current, {
    y: -8,
    repeat: -1,
    yoyo: true,
    duration: 2,
    ease: "sine.inOut",
});

const handleEnter = (e) => {
    gsap.to(e.currentTarget, {
        scale: 1.05,
        duration: 0.2,
    });
};

const handleLeave = (e) => {
    gsap.to(e.currentTarget, {
        scale: 1,
        duration: 0.2,
    });
};

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-hidden relative">
            <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px]" />
    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[180px]" />
</div>
            <nav  ref={navbarRef} className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-wide">
    Bid<span className="text-blue-400">Do</span>
</h1>
                <div className="flex gap-3">
                    {isAuthenticated ? (
                        <button
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                        >
                            {user?.avatar?.url && (
                                <img src={user.avatar.url} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                            )}
                            Profile
                        </button>
                    ) : (
                        <>
                            <button
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave} 
                             onClick={() => navigate('/login')} className="px-5 py-2 rounded-full hover:bg-white/10 transition">
                                Login
                            </button>
                            <button
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave} 
                                onClick={() => navigate('/register')}
                                className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full transition-all"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <div ref={heroRef} className="max-w-3xl mx-auto text-center px-6 pt-16 pb-12">
                <h2 className="hero-title text-6xl font-black leading-tight">
                    Bid. Win. Dominate.
                </h2>
                <p className="hero-text text-xl text-gray-300 mt-6">
                    Create, join, and run real-time auctions — for sports drafts, fantasy leagues, or anything you can bid on.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                    onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave} 
                        onClick={() => navigate('/create')}
                        className="hero-btn bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg"
                    >
                        Create an Auction
                    </button>
                    <button
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave} 
                    onClick={() => navigate('/join')}
                    className="hero-btn border border-blue-400 px-8 py-4 rounded-xl hover:bg-blue-500/20"
                    >
                        Join with Room Code
                    </button>
<form onSubmit={handleEnterRoom} className=" hero-btn flex bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
  <input
    type="text"
    placeholder="Already joined? Enter room code"
    value={enterCode}
    onChange={(e) => setEnterCode(e.target.value)}
    className="bg-transparent px-6 py-4 outline-none w-72"
  />
  <button onMouseEnter={handleEnter} onMouseLeave={handleLeave}  type="submit" className="  bg-blue-500 px-6">
    Enter Room
  </button>
</form>

                </div>
            </div>

            <div  ref={cardsRef} className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 px-6 pb-16">
                <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 " hover:scale-105 hover:border-blue-400 transition-all duration-300>
                    <h3 className="font-semibold mb-2">Live Bidding</h3>
                    <p className="text-sm text-gray-600">Real-time bids, instantly visible to everyone in the room.</p>
                </div>
                <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 " hover:scale-105 hover:border-blue-400 transition-all duration-300>
                    <h3 className="font-semibold mb-2">Role-Based Access</h3>
                    <p className="text-sm text-gray-600">Join as a bidder, participant, or viewer — organizer stays in control.</p>
                </div>
                <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-8 " hover:scale-105 hover:border-blue-400 transition-all duration-300>
                    <h3 className="font-semibold mb-2">Fair & Transparent</h3>
                    <p className="text-sm text-gray-600">Live purse tracking, sale history, and group voting for corrections.</p>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;