import parse, { DOMNode, Element, HTMLReactParserOptions } from 'html-react-parser';
import { FC, ReactElement } from 'react';
import { IHtmlParserProps } from '../shared.interface';

const HtmlParser: FC<IHtmlParserProps> = ({ input }): ReactElement => {
  const parser = (input: string) => {
    const options: HTMLReactParserOptions = {
      replace: (node: DOMNode) => {
        if (node instanceof Element && node.firstChild && (node.firstChild as never)['name'] === 'br') {
          return <></>;
        }
      }
    };

    return <>{parse(input, options)}</>;
  };

  return <>{parser(input)}</>;
};

export default HtmlParser;
