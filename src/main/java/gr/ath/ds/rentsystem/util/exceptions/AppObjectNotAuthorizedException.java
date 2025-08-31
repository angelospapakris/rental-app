package gr.ath.ds.rentsystem.util.exceptions;

public class AppObjectNotAuthorizedException extends AppGenericException {

    private static final String DEFAULT_CODE = "NotAuthorized";

    public AppObjectNotAuthorizedException(String code, String message) {
        super(code + DEFAULT_CODE, message);
    }
}
