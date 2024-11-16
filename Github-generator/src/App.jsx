import React, { useState, useEffect, useRef } from "react";
import { Search, Users, GitBranch, Link, MapPin } from "lucide-react";
import "./App.css";

const App = () => {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false); //prevents multiple fetches
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]); //list of suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); //control
  const suggestionRef = useRef(null);

  // Close all suggestions when clicking outside
  useEffect(() => {
    //checks whether the outside click
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      //skip for short names
      if (username.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/search/users?q=${username}+in:login&per_page=5`
        );
        const data = await response.json();
        setSuggestions(data.items || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [username]);
  //fetch the github user
  const fetchGitHubUser = async (searchUsername) => {
    if (!searchUsername.trim()) return;

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `https://api.github.com/users/${searchUsername}`
      );
      if (!response.ok) throw new Error("User not found");
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };
  // function when a user clicks in any of the suggestions
  const handleSuggestionClick = (suggestionLogin) => {
    //updates the username and then fetches the details
    setUsername(suggestionLogin);
    fetchGitHubUser(suggestionLogin);
  };

  return (
    <div className="container">
      <div className="search-container">
        <h1>GitHub Profile Generator</h1>

        <div className="search-box" ref={suggestionRef}>
          <div className="input-wrapper">
            <input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyUp={(e) => e.key === "Enter" && fetchGitHubUser(username)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion.login)}
                  >
                    <img
                      src={suggestion.avatar_url}
                      alt={suggestion.login}
                      className="suggestion-avatar"
                    />
                    <span>{suggestion.login}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => fetchGitHubUser(username)} disabled={loading}>
            <Search size={16} />
            Search
          </button>
        </div>

        {loading && <div className="loader"></div>}

        {error && <div className="error">{error}</div>}

        {userData && (
          <div className="profile-card">
            <img src={userData.avatar_url} alt={`${userData.login}'s avatar`} />

            <div className="profile-info">
              <h2
                className="profile-name"
                onClick={() => window.open("https://github.com", "_blank")}
                style={{
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "green",
                }}
                title="View GitHub Profile"
              >
                {userData.name || userData.login}
              </h2>
              <p className="username">@{userData.login}</p>

              {userData.bio && <p className="bio">{userData.bio}</p>}

              <div className="stats">
                <div className="stat-item">
                  <Users size={16} />
                  <span>{userData.followers} followers</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{userData.following} following</span>
                </div>
                <div className="stat-item">
                  <GitBranch size={16} />
                  <span>{userData.public_repos} repos</span>
                </div>
              </div>

              {(userData.location || userData.blog) && (
                <div className="user-links">
                  {userData.location && (
                    <div className="link-item">
                      <MapPin size={16} />
                      <span>{userData.location}</span>
                    </div>
                  )}
                  {userData.blog && (
                    <div className="link-item">
                      <Link size={16} />
                      <a
                        href={userData.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {userData.blog}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
