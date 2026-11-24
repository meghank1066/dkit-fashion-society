import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { formatEventDate } from "../utils/eventDate";
import PollWidget from "../components/PollWidget";
import Comments from "../components/Comments";
import VideoTranscript from "../components/VideoTranscript";
import { useAuth } from "../context/AuthContext";
import { hasCookieConsent } from "../components/CookieBanner";

export default function PostPage() {
    const { id } = useParams();
    const { user } = useAuth();

    // Count a view every time someone opens the article - only if they've accepted cookies.
    // Admins' own visits don't count. If they accept while reading, this visit counts too.
    useEffect(() => {
        if (!id || user?.role === "admin") return;
        let counted = false;
        const count = () => {
            if (counted || !hasCookieConsent()) return;
            counted = true;
            API.post(`/api/posts/${id}/view`).catch(() => {});
        };
        count();
        const onConsent = (e) => e.detail === "accepted" && count();
        window.addEventListener("cookie-consent", onConsent);
        return () => window.removeEventListener("cookie-consent", onConsent);
    }, [id, user?.role]);
    const [post, setPost] = useState(null);
    const contentRef = useRef(null);
    const [pollMounts, setPollMounts] = useState([]); // polls found in the article
    const [videoMounts, setVideoMounts] = useState([]); // videos with transcripts

    // Keep the same object between renders. React 19 rewrites the HTML whenever this
    // object changes, which would wipe out the polls drawn inside the article.
    const articleHtml = useMemo(() => ({ __html: post?.content || "" }), [post]);

    // Turn each <div data-poll-id> in the article into a live, votable poll
    useEffect(() => {
        if (!post || !contentRef.current) return;
        const els = contentRef.current.querySelectorAll("[data-poll-id]");
        setPollMounts(
            Array.from(els).map((el) => ({ el, pollId: el.getAttribute("data-poll-id") }))
        );
        const videos = contentRef.current.querySelectorAll("figure[data-transcript-url]");
        setVideoMounts(
            Array.from(videos).map((fig) => ({
                el: fig,
                videoEl: fig.querySelector("video"),
                url: fig.getAttribute("data-transcript-url"),
            }))
        );
    }, [post]);

    useEffect(() => {
        API.get(`/api/posts/${id}`)
            .then(res => {
                setPost(res.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [id]);

    if (!post) {
        return (
            <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <article className="bg-[#f8f5f0] min-h-screen">
            {/* HERO IMAGE */}
            <div className="w-full h-[60vh] overflow-hidden">
                <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover object-[center_10%]"
                />
            </div>

            {/* ARTICLE HEADER */}
         {/* ARTICLE HEADER */}
<div className="max-w-5xl mx-auto px-10 py-16 text-center">
    <p className="uppercase tracking-[0.3em] text-sm">
        {post.category}
    </p>

    <h1 className="font-serif text-6xl md:text-8xl mt-8">
        {post.title}
    </h1>

    <p className="text-xl text-gray-600 mt-8">
        {post.subtitle}
    </p>

    {/* Author Profile Picture and Details */}
    <div className="mt-8 flex items-center justify-center gap-3">
        <img
            src={post.author?.profilePic || "https://via.placeholder.com/40"}
            alt={post.author?.username || "DKIT Fashion Society"}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
        />
        <div className="text-left text-sm">
            <span className="font-medium text-gray-800">
                By {post.author?.username || "DKIT Fashion Society"}
            </span>
            <br />
            <span className="text-gray-500 text-xs">
                {post.eventDate ? formatEventDate(post.eventDate) : new Date(post.createdAt).toLocaleDateString()}
            </span>
        </div>
    </div>
</div>

   {/* ARTICLE CONTENT */}
<div className="max-w-3xl mx-auto px-10 pb-20">
    <div
        className="rich-text prose prose-lg max-w-none [&_p]:mb-6 [&_p:empty]:h-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-black [&_ul]:mb-6 [&_ol]:mb-6"
        ref={contentRef}
        dangerouslySetInnerHTML={articleHtml}
    />
    {pollMounts.map(({ el, pollId }) =>
        createPortal(<PollWidget pollId={pollId} />, el, pollId)
    )}
    {videoMounts.map(({ el, videoEl, url }) =>
        createPortal(<VideoTranscript transcriptUrl={url} videoEl={videoEl} />, el, url)
    )}
</div>

            {/* COMMENTS */}
            <Comments postId={post._id} />
        </article>
    );
}