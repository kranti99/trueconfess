import htmlReactParser from 'html-react-parser';

export default function ConfessionContent({ content }) {
  return <div className="mt-4 text-white">{htmlReactParser(content)}</div>;
}
