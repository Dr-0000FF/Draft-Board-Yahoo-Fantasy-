import React, { useState, useEffect } from "react";
import TeamForm from "./frags/TeamForming";
import PlayerForm from "./frags/PlayerForming";
import DraftBoard from "./frags/Board";
import PlayerPool from "./frags/PlayerBoard";

const positions = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];

function App() {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("teams");
    return saved ? JSON.parse(saved) : [];
  });

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("players");
    return saved ? JSON.parse(saved) : [];
  });

  const [allPlayers, setAllPlayers] = useState(() => {
    const saved = localStorage.getItem("allPlayers");
    return saved ? JSON.parse(saved) : [];
  });

  const [teamNameInput, setTeamNameInput] = useState("");
  const [playerInput, setPlayerInput] = useState({ name: "", position: "QB" });

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(() => {
    const saved = localStorage.getItem("selectedPlayerIndex");
    return saved ? JSON.parse(saved) : null;
  });

  // Load from API only if not already in localStorage
  useEffect(() => {
    if (allPlayers.length === 0) {
      const fetchAllPlayers = async () => {
        try {
          const res = await fetch("http://localhost:4000/all-players");
          const data = await res.json();
          if (Array.isArray(data)) {
            setAllPlayers(data);
            setPlayers(data);
          }
        } catch (error) {
          console.error("Failed to fetch players:", error);
        }
      };

      fetchAllPlayers();
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("allPlayers", JSON.stringify(allPlayers));
  }, [allPlayers]);

  useEffect(() => {
    localStorage.setItem("selectedPlayerIndex", JSON.stringify(selectedPlayerIndex));
  }, [selectedPlayerIndex]);

  const handleSearch = (term) => {
    const lower = term.toLowerCase();
    const filtered = allPlayers.filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
    setPlayers(filtered);
  };

  const handleAddTeam = () => {
    if (teamNameInput.trim()) {
      const newTeam = {
        name: teamNameInput,
        roster: positions.reduce((acc, pos) => ({ ...acc, [pos]: [] }), {}),
      };
      setTeams([...teams, newTeam]);
      setTeamNameInput("");
    }
  };

  const handleAddPlayer = () => {
    if (playerInput.name.trim()) {
      const newPlayer = { ...playerInput, id: Date.now() };
      setPlayers([...players, newPlayer]);
      setAllPlayers([...allPlayers, newPlayer]);
      setPlayerInput({ name: "", position: "QB" });
    }
  };

  const assignPlayerToTeam = (teamIndex, position) => {
    if (selectedPlayerIndex === null) return;
    const player = players[selectedPlayerIndex];
    if (player.position !== position && position !== "FLEX") return;

    const updatedTeams = [...teams];
    updatedTeams[teamIndex].roster[position].push(player);
    setTeams(updatedTeams);

    const updatedPlayers = players.filter((_, i) => i !== selectedPlayerIndex);
    const updatedAll = allPlayers.filter((p) => p.id !== player.id);
    setPlayers(updatedPlayers);
    setAllPlayers(updatedAll);
    setSelectedPlayerIndex(null);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the app?")) {
      localStorage.clear();
      setTeams([]);
      setPlayers([]);
      setAllPlayers([]);
      setTeamNameInput("");
      setPlayerInput({ name: "", position: "QB" });
      setSelectedPlayerIndex(null);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Fantasy Draft Setup</h1>

      <button
        onClick={handleReset}
        className="bg-red-600 text-white px-4 py-2 rounded mb-4"
      >
        Reset App
      </button>

      <DraftBoard teams={teams} assignPlayerToTeam={assignPlayerToTeam} />
      <TeamForm
        teamNameInput={teamNameInput}
        setTeamNameInput={setTeamNameInput}
        handleAddTeam={handleAddTeam}
      />
      <PlayerForm
        playerInput={playerInput}
        setPlayerInput={setPlayerInput}
        handleAddPlayer={handleAddPlayer}
      />
      <PlayerPool
        players={players}
        selectedPlayerIndex={selectedPlayerIndex}
        setSelectedPlayerIndex={setSelectedPlayerIndex}
        onSearch={handleSearch}
      />
    </div>
  );
}

export default App;
