import React, { useState } from "react";
import TeamForm from "./frags/TeamForming";
import PlayerForm from "./frags/PlayerForming";
import DraftBoard from "./frags/Board";
import PlayerPool from "./frags/PlayerBoard";

const positions = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];

function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [playerInput, setPlayerInput] = useState({ name: "", position: "QB" });
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);

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
      setPlayers([...players, { ...playerInput }]);
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
    setPlayers(updatedPlayers);
    setSelectedPlayerIndex(null);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Fantasy Draft Setup</h1>
      <DraftBoard
        teams={teams}
        assignPlayerToTeam={assignPlayerToTeam}
      />
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
      />
    </div>
  );
}

export default App;
