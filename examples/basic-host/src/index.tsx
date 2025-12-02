import { Component, type ErrorInfo, type ReactNode, StrictMode, Suspense, use, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { callTool, connectToServer, hasAppHtml, initializeApp, loadSandboxProxy, log, newAppBridge, type ServerInfo, type ToolCallInfo } from "./implementation";
import styles from "./index.module.css";


const MCP_SERVER_URL = new URL("http://localhost:3001/mcp");


interface HostProps {
  serverInfoPromise: Promise<ServerInfo>;
}
function Host({ serverInfoPromise }: HostProps) {
  const serverInfo = use(serverInfoPromise);
  const [toolCallInfos, setToolCallInfos] = useState<ToolCallInfo[]>([]);

  return (
    <>
      {toolCallInfos.map((info, i) => (
        <ToolCallInfoPanel key={i} toolCallInfo={info} />
      ))}
      <CallToolPanel
        serverInfo={serverInfo}
        addToolCallInfo={(info) => setToolCallInfos([...toolCallInfos, info])}
      />
    </>
  );
}


interface CallToolPanelProps {
  serverInfo: ServerInfo;
  addToolCallInfo: (toolCallInfo: ToolCallInfo) => void;
}
function CallToolPanel({ serverInfo, addToolCallInfo }: CallToolPanelProps) {
  const toolNames = Array.from(serverInfo.tools.keys());
  const [selectedTool, setSelectedTool] = useState(toolNames[0] ?? "");
  const [inputJson, setInputJson] = useState("{}");

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(inputJson);
      return true;
    } catch {
      return false;
    }
  }, [inputJson]);

  const handleSubmit = () => {
    const toolCallInfo = callTool(serverInfo, selectedTool, JSON.parse(inputJson));
    addToolCallInfo(toolCallInfo);
  };

  return (
    <div className={styles.callToolPanel}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          Tool Name
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
          >
            {toolNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Tool Input
          <textarea
            aria-invalid={!isValidJson}
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
          />
        </label>
        <button type="submit" disabled={!selectedTool || !isValidJson}>
          Call Tool
        </button>
      </form>
    </div>
  );
}


interface ToolCallInfoPanelProps {
  toolCallInfo: ToolCallInfo;
}
function ToolCallInfoPanel({ toolCallInfo }: ToolCallInfoPanelProps) {
  return (
    <div className={styles.toolCallInfoPanel}>
      <div className={styles.inputInfoPanel}>
        <h2 className={styles.toolName}>{toolCallInfo.tool.name}</h2>
        <JsonBlock value={toolCallInfo.input} />
      </div>
      <div className={styles.outputInfoPanel}>
        <ErrorBoundary>
          <Suspense fallback="Loading...">
            {
              hasAppHtml(toolCallInfo)
                ? <AppIFramePanel toolCallInfo={toolCallInfo} />
                : <ToolResultPanel toolCallInfo={toolCallInfo} />
            }
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}


function JsonBlock({ value }: { value: object }) {
  return (
    <pre className={styles.jsonBlock}>
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}


interface AppIFramePanelProps {
  toolCallInfo: Required<ToolCallInfo>;
}
function AppIFramePanel({ toolCallInfo }: AppIFramePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current!;
    loadSandboxProxy(iframe).then((firstTime) => {
      // The `firstTime` check guards against React Strict Mode's double
      // invocation (mount → unmount → remount simulation in development).
      // Outside of Strict Mode, this `useEffect` runs only once per
      // `toolCallInfo`.
      if (firstTime) {
        const appBridge = newAppBridge(toolCallInfo.serverInfo, iframe);
        initializeApp(iframe, appBridge, toolCallInfo);
      }
    });
  }, [toolCallInfo]);

  return (
    <div className={styles.appIframePanel}>
      <iframe ref={iframeRef} />
    </div>
  );
}


interface ToolResultPanelProps {
  toolCallInfo: ToolCallInfo;
}
function ToolResultPanel({ toolCallInfo }: ToolResultPanelProps) {
  const result = use(toolCallInfo.resultPromise);
  return <JsonBlock value={result} />;
}


interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: undefined };

  // Called during render phase - must be pure (no side effects)
  // Note: error is `unknown` because JS allows throwing any value
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Called during commit phase - can have side effects (logging, etc.)
  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    log.error("Caught:", error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { error } = this.state;
      const message = error instanceof Error ? error.message : String(error);
      return <div className={styles.error}><strong>ERROR:</strong> {message}</div>;
    }
    return this.props.children;
  }
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<p>Connecting to server ({MCP_SERVER_URL.href})...</p>}>
      <Host serverInfoPromise={connectToServer(MCP_SERVER_URL)} />
    </Suspense>
  </StrictMode>,
);
