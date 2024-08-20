import os
import argparse
import asyncio
from examples.utils.cli import add_data_engine_args, get_data_engine
from pacha.data_engine import DataEngine
from pacha.query_planner import QueryPlanner, QueryPlanningInput, UserTurn
from pacha.query_planner.data_context import DataContext


def render_data_context(data_context: DataContext) -> str:
    rendered = ""
    if data_context.previous_try is not None:
        rendered += render_data_context(data_context.previous_try)
        rendered += "\n=== RETRY ===\n"
    rendered += "\n=== QUERY PLAN ===\n"
    rendered += data_context.query_plan.raw
    rendered += "\n=== EXECUTION RESULT ===\n"
    if data_context.data is not None:
        rendered += data_context.data.output
        if data_context.data.error is not None:
            rendered += "\n"
            rendered += data_context.data.error
    return rendered


async def run(user_prompt: str, data_engine: DataEngine) -> str:
    planner = QueryPlanner(data_engine)
    data_context = await planner.get_data_context(
        QueryPlanningInput([UserTurn(user_prompt)]))
    return render_data_context(data_context)


def read_query_file(file_path: str) -> str:
    with open(file_path, 'r') as file:
        lines = file.readlines()
    # Filter out comment lines and join the remaining lines
    filtered_lines = [
        line for line in lines if not line.strip().startswith('#')]
    return '\n'.join(filtered_lines)


def should_ignore_file(file_path, ignore_list):
    for ignore_pattern in ignore_list:
        if ignore_pattern in file_path:
            return True
    return False


async def process_files(input_dirs, output_root, ignore_list, data_engine):
    for input_dir in input_dirs:
        for root, _, files in os.walk(input_dir):
            if should_ignore_file(root, ignore_list):
                print(f"Ignoring: {root}")
                continue
            print(f"Walking: {root}")
            files.sort()
            for file in files:
                input_file_path = os.path.join(root, file)
                if should_ignore_file(input_file_path, ignore_list):
                    print(f"Ignoring: {input_file_path}")
                    continue
                try:
                    print(f"Processing {input_file_path}")
                    input_text = read_query_file(input_file_path)
                    output_text = await run(input_text, data_engine)

                    # Create corresponding output directory structure
                    relative_path = os.path.relpath(input_file_path, input_dir)
                    output_file_path = os.path.join(output_root, relative_path)

                    os.makedirs(os.path.dirname(
                        output_file_path), exist_ok=True)

                    # Write to the output file
                    with open(output_file_path, 'w') as output_file:
                        output_file.write("=== INPUT ===\n")
                        output_file.write(input_text)
                        output_file.write("\n=== OUTPUT ===\n")
                        output_file.write(output_text)

                    print(f"Processed {input_file_path} -> {output_file_path}")
                except Exception as e:
                    print(f"Error processing {input_file_path}: {e}")


async def main():
    parser = argparse.ArgumentParser(
        description='Process test files and generate output.')
    parser.add_argument('-i', '--input-dir', dest='input_dirs', type=str, action='append', required=True,
                        help='one or more input directories containing test files')
    parser.add_argument('--ignore', dest='ignore_list', type=str, action='append', default=[],
                        help='paths to ignore (substring match)')
    parser.add_argument('-o', '--output-root', dest='output_root', type=str, required=True,
                        help='output root directory where results will be stored')
    add_data_engine_args(parser)
    args = parser.parse_args()
    data_engine = get_data_engine(args)

    await process_files(args.input_dirs, args.output_root,
                  args.ignore_list, data_engine)


if __name__ == "__main__":
    asyncio.run(main())
