from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    details = response.data
    message = details.get("detail", "Request failed.") if isinstance(details, dict) else "Request failed."
    response.data = {
        "error": {
            "status_code": response.status_code,
            "message": str(message),
            "details": details,
        }
    }
    return response
