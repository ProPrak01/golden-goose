"""Create the static figures embedded in the persisted Sarvam evaluation report."""

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


OUT = Path("output/evaluation/figures")
OUT.mkdir(parents=True, exist_ok=True)

INK = "#11110F"
GREEN = "#236D45"
LIME = "#D9FF51"
ORANGE = "#FFBD6F"
PAPER = "#FFFDF7"


def base_axes(ax: plt.Axes) -> None:
    ax.set_facecolor(PAPER)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.grid(axis="x", color="#D9D7CF", linewidth=0.7, zorder=0)
    ax.tick_params(axis="y", length=0, colors=INK)
    ax.tick_params(axis="x", colors=INK)


def category_outcomes() -> None:
    labels = ["Deadlines", "Preferences", "Episodes", "Uncertain details", "Inferred traits"]
    accepted = np.array([250, 80, 56, 0, 0])
    clarified = np.array([0, 0, 0, 40, 0])
    rejected = np.array([0, 0, 4, 0, 70])
    positions = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=(8.9, 3.7), layout="constrained")
    fig.patch.set_facecolor(PAPER)
    ax.barh(positions, accepted, color=GREEN, height=0.62, label="Accepted", zorder=2)
    ax.barh(positions, clarified, left=accepted, color=LIME, edgecolor=INK, linewidth=0.5, height=0.62, label="Clarified", zorder=2)
    ax.barh(positions, rejected, left=accepted + clarified, color=ORANGE, height=0.62, label="Rejected", zorder=2)
    for y, accept, clarify, reject in zip(positions, accepted, clarified, rejected, strict=True):
        ax.text(accept + clarify + reject + 4, y, f"{accept} accept / {clarify} clarify / {reject} reject", va="center", color=INK, fontsize=8.5)
    ax.set_yticks(positions, labels)
    ax.invert_yaxis()
    ax.set_xlim(0, 300)
    ax.set_xlabel("Records", color=INK)
    ax.set_title("Hardened decision outcomes by test category", loc="left", weight="bold", color=INK, pad=12)
    base_axes(ax)
    ax.legend(ncols=3, frameon=False, loc="lower right", labelcolor=INK)
    fig.savefig(OUT / "category_outcomes.png", dpi=220, facecolor=PAPER)
    plt.close(fig)


def policy_match() -> None:
    labels = ["Raw provider\npolicy", "Hardened\nreplay"]
    values = [406, 496]
    fig, ax = plt.subplots(figsize=(5.2, 3.3), layout="constrained")
    fig.patch.set_facecolor(PAPER)
    bars = ax.bar(labels, values, color=[ORANGE, GREEN], width=0.58, zorder=2)
    for bar, value in zip(bars, values, strict=True):
        ax.text(bar.get_x() + bar.get_width() / 2, value + 8, f"{value}\n({value / 5:.1f}%)", ha="center", color=INK, weight="bold")
    ax.set_ylim(0, 550)
    ax.set_ylabel("Records", color=INK)
    ax.set_title("Exact policy agreement: raw vs. hardened", loc="left", weight="bold", color=INK, pad=12)
    base_axes(ax)
    fig.savefig(OUT / "policy_match.png", dpi=220, facecolor=PAPER)
    plt.close(fig)


def latency_comparison() -> None:
    labels = ["Accepted\n(447 calls)", "Rejected\n(53 calls)"]
    averages = [1202.63, 734.25]
    p95 = [2331.9, 1307.4]
    positions = np.arange(len(labels))
    width = 0.34
    fig, ax = plt.subplots(figsize=(5.2, 3.3), layout="constrained")
    fig.patch.set_facecolor(PAPER)
    ax.bar(positions - width / 2, averages, width, color=GREEN, label="Mean", zorder=2)
    ax.bar(positions + width / 2, p95, width, color=LIME, edgecolor=INK, linewidth=0.7, label="p95", zorder=2)
    ax.set_xticks(positions, labels)
    ax.set_ylim(0, 2800)
    ax.set_ylabel("Milliseconds", color=INK)
    ax.set_title("Provider latency", loc="left", weight="bold", color=INK, pad=12)
    base_axes(ax)
    ax.legend(ncols=2, frameon=False, loc="upper right", labelcolor=INK)
    fig.savefig(OUT / "latency_comparison.png", dpi=220, facecolor=PAPER)
    plt.close(fig)


if __name__ == "__main__":
    category_outcomes()
    policy_match()
    latency_comparison()
