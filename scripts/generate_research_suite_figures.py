"""Generate report-ready figures from the versioned Kivi research-suite JSON."""

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / "output/evaluation/research_suite_report.json"
OUT = ROOT / "output/evaluation/figures"

INK = "#11110F"
GREEN = "#236D45"
LIME = "#D9FF51"
ORANGE = "#FFBD6F"
PAPER = "#FFFDF7"
MUTED = "#D9D7CF"


def base_axes(ax: plt.Axes) -> None:
    ax.set_facecolor(PAPER)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.grid(axis="x", color=MUTED, linewidth=0.7, zorder=0)
    ax.tick_params(axis="y", length=0, colors=INK)
    ax.tick_params(axis="x", colors=INK)


def load_report() -> dict:
    if not REPORT.exists():
        raise FileNotFoundError(
            f"Missing {REPORT}. Run `bun run eval:research:report` before generating figures."
        )
    return json.loads(REPORT.read_text(encoding="utf-8"))


def safety_boundary_chart(report: dict) -> None:
    categories = report["safetyBoundary"]["categories"]
    labels = [
        "Explicit\nevidence",
        "Uncertainty",
        "User\nboundary",
        "Evidence\nfidelity",
        "Inferred\ntrait",
        "Weak\nevidence",
    ]
    keys = [
        "explicit-evidence",
        "uncertainty",
        "user-boundary",
        "evidence-fidelity",
        "inferred-trait",
        "weak-evidence",
    ]
    passed = np.array([categories[key]["passedCases"] for key in keys])
    total = np.array([categories[key]["totalCases"] for key in keys])
    positions = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=(9.1, 3.8), layout="constrained")
    fig.patch.set_facecolor(PAPER)
    ax.bar(positions, total, color=MUTED, width=0.64, zorder=1, label="Cases")
    bars = ax.bar(positions, passed, color=GREEN, width=0.64, zorder=2, label="Passed")
    for bar, passed_count, total_count in zip(bars, passed, total, strict=True):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            passed_count + 0.55,
            f"{passed_count}/{total_count}",
            ha="center",
            color=INK,
            fontsize=9,
            weight="bold",
        )
    ax.set_xticks(positions, labels)
    ax.set_ylim(0, 24)
    ax.set_ylabel("Versioned cases", color=INK)
    ax.set_title("Safety Boundary Suite: policy outcomes by adversarial category", loc="left", weight="bold", color=INK, pad=12)
    base_axes(ax)
    ax.legend(ncols=2, frameon=False, loc="upper right", labelcolor=INK)
    fig.savefig(OUT / "research_safety_boundary.png", dpi=220, facecolor=PAPER)
    plt.close(fig)


def suite_summary_chart(report: dict) -> None:
    safety = report["safetyBoundary"]["summary"]
    retrieval = report["retrievalScenarios"]["summary"]
    labels = ["Safety boundary\npolicy", "Multi-turn\nretrieval"]
    values = [safety["passRate"] * 100, retrieval["passRate"] * 100]
    positions = np.arange(len(labels))

    fig, ax = plt.subplots(figsize=(5.4, 3.6), layout="constrained")
    fig.patch.set_facecolor(PAPER)
    bars = ax.bar(positions, values, color=[GREEN, LIME], edgecolor=[GREEN, INK], linewidth=0.7, width=0.58, zorder=2)
    for bar, value in zip(bars, values, strict=True):
        ax.text(bar.get_x() + bar.get_width() / 2, value - 7, f"{value:.0f}%", ha="center", color=INK, weight="bold", fontsize=12)
    ax.set_xticks(positions, labels)
    ax.set_ylim(0, 115)
    ax.set_yticks([0, 25, 50, 75, 100], ["0%", "25%", "50%", "75%", "100%"])
    ax.set_title("Reproducible suite pass rates", loc="left", weight="bold", color=INK, pad=12)
    base_axes(ax)
    fig.savefig(OUT / "research_suite_summary.png", dpi=220, facecolor=PAPER)
    plt.close(fig)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    report = load_report()
    safety_boundary_chart(report)
    suite_summary_chart(report)
