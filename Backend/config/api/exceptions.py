from rest_framework.views import exception_handler


def first_message(details):
    if isinstance(details, dict):
        if "detail" in details:
            return first_message(details["detail"])
        for value in details.values():
            return first_message(value)
    if isinstance(details, list) and details:
        return first_message(details[0])
    return str(details) if details else "Request failed."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    details = response.data
    message = first_message(details)
    response.data = {
        "error": {
            "status_code": response.status_code,
            "message": str(message),
            "details": details,
        }
    }
    return response
