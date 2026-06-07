return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        {/* Outer framing card matching desktop layout with Editorial hairline border */}
        <div className="w-full max-w-5xl bg-[#121212] overflow-hidden flex flex-col md:flex-row min-h-[640px] border border-neutral-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">

            {/* Left Panel: Brand display with dark editorial minimalist background */}
            <div id="brand-panel" className="md:w-[45%] bg-[#0E0E0E] p-8 flex flex-col items-center justify-center text-center relative border-b md:border-b-0 md:border-r border-neutral-800/70">

                {/* Subtle architectural rule background */}
                <div className="absolute inset-x-8 top-1/2 h-[1px] bg-neutral-800/40 pointer-events-none" />
                <div className="absolute inset-y-12 left-1/2 w-[1px] bg-neutral-800/40 pointer-events-none" />

                <div className="absolute top-6 left-6 flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono tracking-[0.2em] uppercase">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-pulse inline-block" />
                    Civic Journal
                </div>

                <div className="absolute bottom-6 right-6 flex items-center gap-1 text-[9px] text-neutral-500 font-mono tracking-[0.1em]">
                    Harmonic Dispatch Edition
                </div>

                {/* Centered Logo, brand name and tagline exactly beneath logo */}
                <div className="relative z-10 py-10 flex flex-col items-center">
                    <Logo size={150} hideText={false} light={true} />
                </div>
            </div>

            {/* Right Panel: Sign In and Demo accounts in minimalist monochrome */}
            <div id="signin-panel" className="md:w-[55%] p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-3xl font-light font-serif text-white tracking-wide">Authenticate</h2>
                        <p className="mt-2 text-xs font-serif italic text-neutral-400">
                            Identify as a local citizen or municipal responder to view dispatch.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-950/20 border border-red-900/50 text-red-300 rounded-sm text-xs font-mono animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="name@localeyes.gov"
                                className="w-full px-3 py-2.5 bg-[#181818] border border-neutral-800 text-white rounded-none focus:outline-hidden focus:border-neutral-500 transition-all text-xs font-mono placeholder-neutral-600 shadow-inner"
                                id="email-input"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                                    Security Passcode
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2.5 bg-[#181818] border border-neutral-800 text-white rounded-none focus:outline-hidden focus:border-neutral-500 transition-all text-xs font-mono placeholder-neutral-600 shadow-inner pr-10"
                                    id="password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-[#FAFAFA] text-[#0A0A0A] font-medium rounded-none hover:bg-neutral-200 active:bg-neutral-300 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 mt-2 cursor-pointer border border-transparent font-mono"
                            id="login-btn"
                        >
                            Access Portal
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <span className="text-[11px] font-mono text-neutral-500">
                            Authorized entry required.{' '}
                            <button
                                onClick={() => handleQuickLogin('citizen')}
                                className="text-white hover:underline uppercase tracking-wider text-[10px] ml-1 font-bold"
                            >
                                Bypass
                            </button>
                        </span>
                    </div>

                    {/* DEMO ACCOUNTS DIVIDER */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-neutral-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase font-mono tracking-[0.3em]">
                            <span className="bg-[#121212] px-4 text-neutral-500">Respondents Grid</span>
                        </div>
                    </div>

                    {/* CITIZEN PROFILE BUTTON */}
                    <button
                        onClick={() => handleQuickLogin('citizen')}
                        className="w-full mb-4 p-3.5 bg-[#181818] hover:bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-4 text-left group cursor-pointer rounded-none"
                        id="demo-citizen-btn"
                    >
                        <div className="w-8 h-8 bg-[#262626] text-neutral-300 flex items-center justify-center group-hover:bg-[#fa3f3f]/10 group-hover:text-[#FAFAFA] transition-all">
                            <Users size={15} />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-mono tracking-wider text-neutral-200">Public Observer Profile</p>
                            <p className="text-[10px] text-neutral-400 group-hover:text-white transition-colors font-mono">Simulate resident status ({userEmail})</p>
                        </div>
                    </button>

                    {/* AGENCIES GRID CONTAINER */}
                    <div className="grid grid-cols-2 gap-2 font-mono">

                        {/* Police */}
                        <button
                            onClick={() => handleQuickLogin('police')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none"
                            id="demo-police-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <Shield size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Police Force</span>
                        </button>

                        {/* Fire Dept */}
                        <button
                            onClick={() => handleQuickLogin('fire')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none"
                            id="demo-fire-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <Flame size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Fire & Rescue</span>
                        </button>

                        {/* Healthcare */}
                        <button
                            onClick={() => handleQuickLogin('healthcare')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none"
                            id="demo-health-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <Activity size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Health Dept</span>
                        </button>

                        {/* Traffic */}
                        <button
                            onClick={() => handleQuickLogin('traffic')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none"
                            id="demo-traffic-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <TrafficCone size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Transit</span>
                        </button>

                        {/* PWD */}
                        <button
                            onClick={() => handleQuickLogin('pwd')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none hover:border-neutral-500"
                            id="demo-pwd-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <Wrench size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Public Works</span>
                        </button>

                        {/* Water */}
                        <button
                            onClick={() => handleQuickLogin('water')}
                            className="p-3 bg-[#181818] hover:bg-neutral-800/70 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col items-center justify-center cursor-pointer rounded-none"
                            id="demo-water-btn"
                        >
                            <div className="w-7 h-7 rounded-sm bg-[#262626] text-neutral-300 flex items-center justify-center mb-1.5">
                                <Droplet size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-300">Water Supply</span>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    </div>
);
}