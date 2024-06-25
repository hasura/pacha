import logging


def get_logger() -> logging.Logger:
    return logging.getLogger("pacha")


def setup_logger(log_level) -> logging.Logger:
    logger = get_logger()
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(level=log_level)
    return logger
