import React from "react";

const positions = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];

function DraftBoard({ teams, assignPlayerToTeam }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border text-center">
                <thead>
                    <tr>
                        <th className="border p-2 bg-gray-100">Team</th>
                        {positions.map((pos) => (
                            <th key={pos} className="border p-2 bg-gray-100">{pos}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team, index) => (
                        <tr key={index}>
                            <td className="border p-2 font-semibold bg-gray-50">{team.name}</td>
                            {positions.map((pos) => (
                                <td
                                    key={pos}
                                    className="border p-2 cursor-pointer hover:bg-blue-100 align-top text-left"
                                    onClick={() => assignPlayerToTeam(index, pos)}
                                >
                                    {team.roster[pos].length > 0 ? (
                                        <ul className="list-disc ml-4">
                                            {team.roster[pos].map((player, i) => (
                                                <li key={i}>{player.name}</li>
                                            ))}
                                        </ul>
                                    ) : "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DraftBoard;
