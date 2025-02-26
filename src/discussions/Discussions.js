import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight"; // Enables syntax highlighting
import yaml from "js-yaml";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css"; // Import dark theme
import "./Discussions.css";
import { useNavigate } from "react-router-dom";

function Discussions() {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/posts/posts.yaml")
      .then((res) => res.text())
      .then((yamlText) => {
        try {
          const data = yaml.load(yamlText);
          setPosts(data?.posts || []);
        } catch (error) {
          console.error("Error parsing YAML:", error);
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching YAML:", err);
        setPosts([]);
      });
  }, []);

  // Force scrollbar styles to be applied when a post loads
  useEffect(() => {
    if (currentPost) {
      setTimeout(() => {
        document.querySelectorAll("pre").forEach((el) => {
          el.classList.add("custom-scrollbar");
        });
      }, 100); // Small delay to allow rendering
    }
  }, [currentPost]);

  

  const loadPost = async (file, title) => {
    setLoading(true);
    setSelectedTitle(title);
    try {
      const response = await fetch(`/posts/${file}`);
      if (!response.ok) throw new Error("Failed to load file");
      const text = await response.text();
      setCurrentPost(text);
    } catch (error) {
      console.error("Error loading post:", error);
      setCurrentPost("Error loading this discussion.");
    } finally {
      setLoading(false);
    }
  };

  const closePost = () => {
    setCurrentPost(null);
    setSelectedTitle("");
  };

  return (
    <div className="discussions-container fade-in">
      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      {currentPost ? (
        <div className="post-wrapper">
          <div className="post-viewer">
            <button className="close-button" onClick={closePost}>
              ✖ Close
            </button>
            <h2 className="post-header">{selectedTitle}</h2>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
              {currentPost}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          <h1 className="discussions-title">Discussions</h1>
          <div className="divider"></div>

          <ul className="post-list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <li
                  key={post.file}
                  onClick={() => loadPost(post.file, post.title)}
                  className="post-item"
                >
                  <strong className="post-title">{post.title}</strong>
                  <span className="post-date">({post.date})</span>
                </li>
              ))
            ) : (
              <p className="loading-text">No discussions available.</p>
            )}
          </ul>

          {loading && <p className="loading-text">Loading...</p>}
        </>
      )}
    </div>
  );
}

export default Discussions;
