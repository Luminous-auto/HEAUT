import Layout from "./Layout.jsx";

import Entries from "./Entries";

import Insights from "./Insights";

import Journal from "./Journal";

import Tokens from "./Tokens";

import Creations from "./Creations";

import CreativeEditor from "./CreativeEditor";

import TextEntry from "./TextEntry";

import MentalHealthInsights from "./MentalHealthInsights";

import CreativityInsights from "./CreativityInsights";

import Profile from "./Profile";

import Settings from "./Settings";

import Home from "./Home";

import Refer from "./Refer";

import Surveys from "./Surveys";

import TakeSurvey from "./TakeSurvey";

import SurveyResult from "./SurveyResult";

import SelfAwarenessInsights from "./SelfAwarenessInsights";

import SoulMate from "./SoulMate";

import HumanSupport from "./HumanSupport";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Entries: Entries,
    
    Insights: Insights,
    
    Journal: Journal,
    
    Tokens: Tokens,
    
    Creations: Creations,
    
    CreativeEditor: CreativeEditor,
    
    TextEntry: TextEntry,
    
    MentalHealthInsights: MentalHealthInsights,
    
    CreativityInsights: CreativityInsights,
    
    Profile: Profile,
    
    Settings: Settings,
    
    Home: Home,
    
    Refer: Refer,
    
    Surveys: Surveys,
    
    TakeSurvey: TakeSurvey,
    
    SurveyResult: SurveyResult,
    
    SelfAwarenessInsights: SelfAwarenessInsights,
    
    SoulMate: SoulMate,
    
    HumanSupport: HumanSupport,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Entries />} />
                
                
                <Route path="/Entries" element={<Entries />} />
                
                <Route path="/Insights" element={<Insights />} />
                
                <Route path="/Journal" element={<Journal />} />
                
                <Route path="/Tokens" element={<Tokens />} />
                
                <Route path="/Creations" element={<Creations />} />
                
                <Route path="/CreativeEditor" element={<CreativeEditor />} />
                
                <Route path="/TextEntry" element={<TextEntry />} />
                
                <Route path="/MentalHealthInsights" element={<MentalHealthInsights />} />
                
                <Route path="/CreativityInsights" element={<CreativityInsights />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Refer" element={<Refer />} />
                
                <Route path="/Surveys" element={<Surveys />} />
                
                <Route path="/TakeSurvey" element={<TakeSurvey />} />
                
                <Route path="/SurveyResult" element={<SurveyResult />} />
                
                <Route path="/SelfAwarenessInsights" element={<SelfAwarenessInsights />} />
                
                <Route path="/SoulMate" element={<SoulMate />} />
                
                <Route path="/HumanSupport" element={<HumanSupport />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}