import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  LoaderCircle,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { appConfig } from "./appConfig";
import type { WalletDiagnostics } from "./lib/genlayer";
import { connectWallet, extractCaseId, getCase, getLatestCaseId, submitCase } from "./lib/genlayer";

type Decision = {
  headline: string;
  verdict: "APPROVE" | "REVIEW" | "REJECT";
  score: number;
  reasons: string[];
  next_action: string;
  proof_of_advantage: string;
  app: string;
  mode: string;
};

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` | undefined;

function parseDecision(raw: unknown): Decision | null {
  if (typeof raw !== "string") {
    return null;
  }

  try {
    return JSON.parse(raw) as Decision;
  } catch {
    return null;
  }
}

function verdictTone(result: Decision | null) {
  switch (result?.verdict) {
    case "APPROVE":
      return "bg-emerald-500 text-white";
    case "REJECT":
      return "bg-red-500 text-white";
    default:
      return "bg-amber-400 text-black";
  }
}

function providerLabel(diagnostics: WalletDiagnostics | null) {
  return diagnostics?.providerLabel ?? "Waiting";
}

export default function App() {
  const [client, setClient] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(null);
  const [walletDiagnostics, setWalletDiagnostics] = useState<WalletDiagnostics | null>(null);
  const [primaryInput, setPrimaryInput] = useState(appConfig.primaryPlaceholder);
  const [secondaryInput, setSecondaryInput] = useState(appConfig.secondaryPlaceholder);
  const [result, setResult] = useState<Decision | null>(null);
  const [status, setStatus] = useState("Connect treasury wallet and approve the Studionet switch if the provider asks.");
  const [isBusy, setIsBusy] = useState(false);

  const themeStyle = useMemo(
    () =>
      ({
        "--accent": appConfig.theme.accent,
        "--accent-soft": appConfig.theme.accentSoft,
        "--surface": appConfig.theme.surface,
        "--ink": appConfig.theme.ink,
      }) as CSSProperties,
    [],
  );

  async function onConnect() {
    try {
      setStatus("Checking wallet access and switching to Studionet...");
      const wallet = await connectWallet();
      setClient(wallet.client);
      setWalletAddress(wallet.walletAddress);
      setWalletDiagnostics(wallet.diagnostics);
      setStatus("Treasury wallet ready. Submit the invoice review when ready.");

      if (contractAddress) {
        try {
          const latestCaseId = await getLatestCaseId(wallet.client, contractAddress, wallet.walletAddress);
          const raw = await getCase(wallet.client, contractAddress, Number(latestCaseId));
          const parsed = parseDecision(raw);
          if (parsed) {
            setResult(parsed);
          }
        } catch {
          // Fresh wallet state can be empty.
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!client || !walletAddress) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!contractAddress) {
      setStatus("Missing VITE_CONTRACT_ADDRESS. Deploy the contract first.");
      return;
    }

    try {
      setIsBusy(true);
      setStatus("Sending treasury review to Studionet...");
      const receipt = await submitCase(client, contractAddress, primaryInput, secondaryInput);
      const caseId = extractCaseId(receipt);

      if (caseId === null) {
        throw new Error("Transaction landed but the case id was not readable from the receipt.");
      }

      setStatus("Consensus accepted. Reading the stored result...");
      const raw = await getCase(client, contractAddress, caseId);
      const parsed = parseDecision(raw);

      if (!parsed) {
        throw new Error("The contract returned a result that could not be parsed.");
      }

      setResult(parsed);
      setStatus("Decision written to the treasury ledger.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main
      style={themeStyle}
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,138,61,0.2),transparent_26%),linear-gradient(180deg,#0f0b08_0%,#1b120b_40%,#f6ede4_40%,#f7f1ea_100%)] px-4 py-6 text-[var(--ink)] sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[#120d09] text-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
                    <ReceiptText className="h-4 w-4" />
                    Treasury control room
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {appConfig.modeLabel}
                  </div>
                </div>

                <div className="max-w-3xl space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#ffb27f]">Invoice screening</p>
                  <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">{appConfig.name}</h1>
                  <p className="max-w-2xl text-lg text-white/72">{appConfig.oneLiner}</p>
                  <p className="max-w-2xl text-sm leading-7 text-white/58">{appConfig.pitch}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Reserve posture</p>
                        <p className="mt-2 text-2xl font-semibold">Budget lane</p>
                      </div>
                      <Landmark className="h-5 w-5 text-[#ffb27f]" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Auto-approve band", value: "< $20k" },
                        { label: "Current request", value: "$48k" },
                        { label: "Route", value: result?.verdict ?? "REVIEW" },
                        { label: "Escalation", value: result ? "Logged" : "Standby" },
                      ].map(item => (
                        <div key={item.label} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{item.label}</p>
                          <p className="mt-2 text-lg font-medium">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-black/30 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Decision corridor</p>
                        <p className="mt-2 text-2xl font-semibold">Review ladder</p>
                      </div>
                      <ShieldAlert className="h-5 w-5 text-[#ffb27f]" />
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Policy fit", value: result?.score ?? 78 },
                        { label: "Operational urgency", value: result ? Math.max(40, result.score - 9) : 70 },
                        { label: "Treasury risk", value: result?.verdict === "REJECT" ? 86 : 54 },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/48">
                            <span>{item.label}</span>
                            <span>{item.value}/100</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-[#ff8a3d]" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    "Reads invoice context and internal spend policy together.",
                    "Stores the treasury verdict after a wallet-signed write.",
                    "Keeps the next action and reasons visible as a finance memo.",
                  ].map(line => (
                    <div key={line} className="rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))] p-6 lg:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/45">Wallet rail</p>
                  <ShieldCheck className="h-5 w-5 text-[#ffb27f]" />
                </div>

                <button
                  type="button"
                  onClick={onConnect}
                  className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#ff8a3d] px-4 py-4 font-semibold text-[#2b170b] transition hover:translate-y-[-1px]"
                >
                  <Wallet className="h-4 w-4" />
                  {walletAddress ? "Treasury wallet connected" : "Connect wallet"}
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                    <p className="font-medium text-white">Provider</p>
                    <p className="mt-2">{providerLabel(walletDiagnostics)}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                    <p className="font-medium text-white">Chain</p>
                    <p className="mt-2">{walletDiagnostics?.currentChainId ?? "Waiting for detection"}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                  <p className="font-medium text-white">Status</p>
                  <p className="mt-2 leading-6">{status}</p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                  <p className="font-medium text-white">Contract</p>
                  <p className="mono mt-2 break-all text-xs text-white/55">{contractAddress ?? "Deploy first"}</p>
                </div>

                {walletAddress ? (
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                    <p className="font-medium text-white">Active wallet</p>
                    <p className="mono mt-2 break-all text-xs text-white/55">{walletAddress}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
          >
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-black/40">Treasury intake</p>
              <h2 className="text-3xl font-semibold">Route a payment request</h2>
              <p className="text-sm leading-6 text-black/62">{appConfig.task}</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-black">{appConfig.primaryLabel}</span>
              <textarea
                value={primaryInput}
                onChange={event => setPrimaryInput(event.target.value)}
                rows={10}
                className="w-full rounded-[26px] border border-black/10 bg-[#fcfaf8] px-4 py-4 text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-black">{appConfig.secondaryLabel}</span>
              <textarea
                value={secondaryInput}
                onChange={event => setSecondaryInput(event.target.value)}
                rows={8}
                className="w-full rounded-[26px] border border-black/10 bg-[#fcfaf8] px-4 py-4 text-sm text-black outline-none transition focus:border-black/30"
              />
            </label>

            <button
              type="submit"
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-[26px] bg-[#1c140f] px-4 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ReceiptText className="h-5 w-5" />}
              {isBusy ? "Running consensus..." : "Write treasury decision"}
            </button>
          </form>

          <section className="rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-black/40">Ledger output</p>
                <h2 className="mt-2 text-3xl font-semibold">Latest decision memo</h2>
              </div>
              {result ? (
                <span className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${verdictTone(result)}`}>
                  {result.verdict}
                </span>
              ) : null}
            </div>

            {result ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[28px] border border-black/10 bg-[#fcfaf8] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-semibold">{result.headline}</p>
                    <span className="rounded-full bg-black px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                      Score {result.score}/100
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-black/65">{result.next_action}</p>
                </div>

                <div className="grid gap-3">
                  {result.reasons.map(reason => (
                    <div key={reason} className="flex items-start gap-3 rounded-[24px] border border-black/10 bg-white px-4 py-4">
                      <ArrowRight className="mt-0.5 h-4 w-4 text-[#ff8a3d]" />
                      <p className="text-sm leading-6 text-black/72">{reason}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] bg-[#1c140f] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Why GenLayer</p>
                  <p className="mt-3 text-sm leading-7 text-white/78">{result.proof_of_advantage}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <div className="rounded-[28px] border border-dashed border-black/15 bg-[#fcfaf8] p-5">
                  <p className="text-lg font-semibold">No decision recorded yet</p>
                  <p className="mt-2 text-sm leading-6 text-black/62">
                    Connect a wallet, submit the invoice context, and the latest treasury memo will appear here.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Policy fit", value: "Budget + exception" },
                    { label: "Risk view", value: "Operational + spend" },
                    { label: "Stored result", value: "Reasons + next action" },
                  ].map(item => (
                    <div key={item.label} className="rounded-[24px] border border-black/10 bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-black/42">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-black/72">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
