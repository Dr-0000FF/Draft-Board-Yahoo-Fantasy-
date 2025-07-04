import React from "react";

function TeamForm({ teamNameInput, setTeamNameInput, handleAddTeam }) {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Add Team</h2>
            <input
                className="border p-2 mr-2"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
                placeholder="Team name"
            />
            <button
                onClick={handleAddTeam}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Add Team
            </button>
        </div>
    );
}

export default TeamForm;
